export class RemoveFavoriteMovieFailureEvent {
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
