import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { MovieSearchCompleteEvent } from '../events/movie-search-complete.event';
import { MovieSearchFailedEvent } from '../events/movie-search-failed.event';
import { SemanticMovieSearchFailedEvent } from '../events/semantic-movie-search-failed.event';
import { SemanticMovieSearchCompleteEvent } from '../events/semantic-movie-search-complete.event';
import { MovieRecommendationsCompleteEvent } from '../events/movie-recommendetations-complete.event';
import { MovieRecommendationsFailedEvent } from '../events/movie-recommendations-failed.event';
import { SearchMovieQuery } from '../query/search-movie.query';
import { SemanticSearchMovieQuery } from '../query/semantic-search-movie.query';
import { GetMovieRecommendationsQuery } from '../query/get-movie-recommendations.query';
import { GetSuggestedMovieTitlesQuery } from '../query/get-suggested-movie-titles.query';
import { Movie } from 'src/types';

@Processor('movie')
export class MovieSearchProcessor extends WorkerHost {
  constructor(
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async process(
    job: Job<{
      queryId: string;
      query: string;
      filters: { page: string; limit: string };
    }>,
  ) {
    switch (job.name) {
      case 'movie-search':
        await this.processSearchMovie(job);
        break;
      case 'semantic-movie-search':
        await this.processSemanticMovieSearch(job);
        break;
      case 'movie-recommendations':
        await this.processMovieRecommendations(job);
    }
  }

  private async processSearchMovie(job: Job) {
    const start = Date.now();

    try {
      const { queryId, query, filters } = job.data;
      const { page, limit } = filters;

      const { movies } = await this.queryBus.execute(
        new SearchMovieQuery(query, page, limit),
      );

      this.eventBus.publish(
        new MovieSearchCompleteEvent(queryId, movies, Date.now() - start),
      );
    } catch (error) {
      this.eventBus.publish(
        new MovieSearchFailedEvent(job.data.queryId, error.message),
      );
    }
  }

  private async processSemanticMovieSearch(job: Job) {
    const start = Date.now();

    try {
      const { queryId, query } = job.data;

      const suggestedTitles: string[] = await this.queryBus.execute(
        new GetSuggestedMovieTitlesQuery(query),
      );

      if (suggestedTitles.length === 0) {
        const { movies } = await this.queryBus.execute(
          new SearchMovieQuery(query, 1, 10),
        );
        this.eventBus.publish(
          new SemanticMovieSearchCompleteEvent(
            queryId,
            movies,
            Date.now() - start,
          ),
        );
        return;
      }

      const moviePromises = suggestedTitles.map(async (title) => {
        try {
          const { movies } = await this.queryBus.execute(
            new SearchMovieQuery(title, 1, 1),
          );
          return movies[0];
        } catch (error) {
          console.error(error);
          return null;
        }
      });

      const movieResults = await Promise.all(moviePromises);
      const foundMovies: Movie[] = movieResults.filter((movie) =>
        Boolean(movie),
      );

      if (foundMovies.length === 0) {
        throw new Error('No movies found for suggested titles');
      }

      const rankedMovies = await this.queryBus.execute(
        new SemanticSearchMovieQuery(query, foundMovies),
      );

      this.eventBus.publish(
        new SemanticMovieSearchCompleteEvent(
          queryId,
          rankedMovies,
          Date.now() - start,
        ),
      );
    } catch (error) {
      this.eventBus.publish(
        new SemanticMovieSearchFailedEvent(job.data.queryId, error.message),
      );
    }
  }

  private async processMovieRecommendations(job: Job) {
    const start = Date.now();

    try {
      const { queryId } = job.data;

      const recommendedMovies = await this.queryBus.execute(
        new GetMovieRecommendationsQuery(),
      );

      this.eventBus.publish(
        new MovieRecommendationsCompleteEvent(
          queryId,
          recommendedMovies,
          Date.now() - start,
        ),
      );
    } catch (error) {
      console.log(error);
      this.eventBus.publish(
        new MovieRecommendationsFailedEvent(job.data.queryId, error.message),
      );
    }
  }
}
