export class AddFavoriteMovieFailureEvent {
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
