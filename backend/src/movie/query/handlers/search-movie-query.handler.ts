import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchMovieQuery } from '../search-movie.query';
import { MovieService } from '../../services/movie.service';
import { SearchResponse } from 'src/types';

@QueryHandler(SearchMovieQuery)
export class SearchMovieQueryHandler
  implements ICommandHandler<SearchMovieQuery>
{
  constructor(private readonly movieService: MovieService) {}
  async execute({
    query,
    page,
    limit,
  }: SearchMovieQuery): Promise<SearchResponse> {
    return this.movieService.search(query, page, limit);
  }
}
