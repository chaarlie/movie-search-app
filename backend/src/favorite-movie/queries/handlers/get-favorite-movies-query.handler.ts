import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Movie } from 'src/types';
import { FavoritesService } from '../../services/favorites.service';
import { GetFavoriteMoviesQuery } from '../get-favorite-movies.query';

@QueryHandler(GetFavoriteMoviesQuery)
export class GetFavoriteMoviesQueryHandler
  implements IQueryHandler<GetFavoriteMoviesQuery>
{
  constructor(private readonly favoritesService: FavoritesService) {}

  async execute(): Promise<Movie[]> {
    return this.favoritesService.getAll();
  }
}
