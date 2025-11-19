export class MovieRecommendationsFailedEvent {
  constructor(
    public readonly queryId: string,
    public readonly message: string,
  ) {}
}
