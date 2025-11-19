import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { FavoritesService } from '../services/favorites.service';
import { Movie } from 'src/types';
import { AddFavoriteCommand } from '../commands/add-favorite.command';

import { RemoveFavoriteCommand } from '../commands/remove-favorite.command';
import { RemoveFavoriteMovieSuccessEvent } from '../events/remove-favorite-movie-failure.event';
import { RemoveFavoriteMovieFailureEvent } from '../events/remove-favorite-movie-success.event';
import { GetFavoriteMoviesQuery } from '../queries/get-favorite-movies.query';
import { AddFavoriteMovieSuccessEvent } from '../events/add-favorite-movie-success.event';
import { AddFavoriteMovieFailureEvent } from '../events/add-favorite-movie-failure.event';
import { GetFavoriteMoviesSuccessEvent } from '../events/get-favorite-movies-success.event';
import { GetFavoriteMoviesFailureEvent } from '../events/get-favorite-movies-failure.event';

@Processor('favorite-movie')
export class FavoriteMovieProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
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
      case 'add-favorite-movie':
        await this.processAddFavoriteMovie(job);
        break;
      case 'remove-favorite-movie':
        await this.processRemoveFavoriteMovie(job);
        break;
      case 'get-all-favorite-movies':
        await this.processGetAllFavoriteMovies(job);
    }
  }

  private async processAddFavoriteMovie(job: Job) {
    const start = Date.now();

    const { movie, queryId } = job.data;

    const newMovie = Object.assign({}, movie) as Movie;

    await this.commandBus.execute(new AddFavoriteCommand(newMovie));

    const favoriteMovies = await this.queryBus.execute(
      new GetFavoriteMoviesQuery(),
    );

    this.eventBus.publish(
      new AddFavoriteMovieSuccessEvent(
        queryId,
        favoriteMovies,
        Date.now() - start,
      ),
    );

    try {
    } catch (error) {
      this.eventBus.publish(
        new AddFavoriteMovieFailureEvent(job.data.queryId, error.message),
      );
    }
  }

  private async processRemoveFavoriteMovie(job: Job) {
    const start = Date.now();

    const { queryId, imdbID } = job.data;

    await this.commandBus.execute(new RemoveFavoriteCommand(imdbID));

    const favoriteMovies = await this.queryBus.execute(
      new GetFavoriteMoviesQuery(),
    );

    this.eventBus.publish(
      new RemoveFavoriteMovieSuccessEvent(
        queryId,
        favoriteMovies,
        Date.now() - start,
      ),
    );

    try {
    } catch (error) {
      this.eventBus.publish(
        new RemoveFavoriteMovieFailureEvent(job.data.queryId, error.message),
      );
    }
  }

  private async processGetAllFavoriteMovies(job: Job) {
    const start = Date.now();

    const { queryId } = job.data;

    const favoriteMovies = await this.queryBus.execute(
      new GetFavoriteMoviesQuery(),
    );

    this.eventBus.publish(
      new GetFavoriteMoviesSuccessEvent(
        queryId,
        favoriteMovies,
        Date.now() - start,
      ),
    );

    try {
    } catch (error) {
      this.eventBus.publish(
        new GetFavoriteMoviesFailureEvent(job.data.queryId, error.message),
      );
    }
  }
}
