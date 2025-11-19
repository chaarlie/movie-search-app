import { Movie } from 'src/types';

export class SemanticSearchMovieQuery {
  constructor(
    public readonly query: string,
    public readonly movies: Movie[],
  ) {}
}
