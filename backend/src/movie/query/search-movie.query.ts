export class SearchMovieQuery {
  constructor(
    public readonly query: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
