import { Movie } from 'src/types';

export class MovieRecommendationsCompleteEvent {
  constructor(
    public readonly queryId: string,
    public readonly response: Movie[],
    public readonly durationMs: number,
  ) {}
}
