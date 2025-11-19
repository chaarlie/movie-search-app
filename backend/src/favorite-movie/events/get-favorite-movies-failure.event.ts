export class GetFavoriteMoviesFailureEvent {
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
