import { SearchResponse } from 'src/types';

export class MovieSearchCompleteEvent {
  constructor(
    public readonly queryId: string,
    public readonly response: SearchResponse,
    public readonly durationMs: number,
  ) {}
}
