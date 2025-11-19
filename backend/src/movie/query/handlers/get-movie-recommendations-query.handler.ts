import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { SearchMovieQuery } from '../search-movie.query';
import { Movie } from 'src/types';
import { GetMovieRecommendationsQuery } from '../get-movie-recommendations.query';
import { AIService } from 'src/ai/ai.service';
import { GetFavoriteMoviesQuery } from 'src/favorite-movie/queries/get-favorite-movies.query';

@QueryHandler(GetMovieRecommendationsQuery)
export class GetMovieRecommendationsQueryHandler
  implements ICommandHandler<GetMovieRecommendationsQuery>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly AIService: AIService,
  ) {}
  async execute(): Promise<Movie[]> {
    const favorites = await this.queryBus.execute(new GetFavoriteMoviesQuery());

    const recommendedMovieTitles =
      await this.AIService.getRecommendations(favorites);

    const recommendationResult = await Promise.all(
      recommendedMovieTitles.map((title) =>
        this.queryBus.execute(new SearchMovieQuery(title, 1, 1)),
      ),
    );

    return recommendationResult.flatMap(({ movies }) => movies);
  }
}
