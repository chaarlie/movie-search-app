export class MovieSearchFailedEvent {
  response: any;
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
