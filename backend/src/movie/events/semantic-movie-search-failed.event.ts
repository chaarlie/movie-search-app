export class SemanticMovieSearchFailedEvent {
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
