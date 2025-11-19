import { Controller, Query, Sse } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { Observable, filter, map } from 'rxjs';
import { MovieSearchCompleteEvent } from '../events/movie-search-complete.event';
import { MovieSearchFailedEvent } from '../events/movie-search-failed.event';
import { SemanticMovieSearchCompleteEvent } from '../events/semantic-movie-search-complete.event';
import { SemanticMovieSearchFailedEvent } from '../events/semantic-movie-search-failed.event';
import { MovieRecommendationsCompleteEvent } from '../events/movie-recommendetations-complete.event';
import { MovieRecommendationsFailedEvent } from '../events/movie-recommendations-failed.event';

@Controller('/movie/stream')
export class MovieSseController {
  constructor(private readonly eventBus: EventBus) {}
  @Sse('/search')
  movieSearch(@Query('queryId') queryId?: string): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(MovieSearchCompleteEvent, MovieSearchFailedEvent),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof MovieSearchCompleteEvent
          ? ({
              data: {
                status: 'success',
                results: event.response,
                duration: event.durationMs,
              },
            } as MessageEvent)
          : ({
              data: {
                status: 'failure',
                errorMessage: event.message,
              },
            } as MessageEvent),
      ),
    );
  }

  @Sse('/semantic-search')
  semanticMovieSearch(
    @Query('queryId') queryId?: string,
  ): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(SemanticMovieSearchCompleteEvent, SemanticMovieSearchFailedEvent),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof SemanticMovieSearchCompleteEvent
          ? ({
              data: {
                status: 'success',
                results: event.response,
                duration: event.durationMs,
              },
            } as MessageEvent)
          : ({
              data: {
                status: 'failure',
                errorMessage: event.message,
              },
            } as MessageEvent),
      ),
    );
  }

  @Sse('/recommendations')
  movieRecommendations(
    @Query('queryId') queryId?: string,
  ): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(
        MovieRecommendationsCompleteEvent,
        MovieRecommendationsFailedEvent,
      ),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof MovieRecommendationsCompleteEvent
          ? ({
              data: {
                status: 'success',
                results: event.response,
                duration: event.durationMs,
              },
            } as MessageEvent)
          : ({
              data: {
                status: 'failure',
                errorMessage: event.message,
              },
            } as MessageEvent),
      ),
    );
  }
}
