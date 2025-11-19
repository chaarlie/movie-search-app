import { Controller, Query, Sse } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { Observable, filter, map } from 'rxjs';

import { RemoveFavoriteMovieSuccessEvent } from '../events/remove-favorite-movie-failure.event';
import { RemoveFavoriteMovieFailureEvent } from '../events/remove-favorite-movie-success.event';
import { AddFavoriteMovieFailureEvent } from '../events/add-favorite-movie-failure.event';
import { AddFavoriteMovieSuccessEvent } from '../events/add-favorite-movie-success.event';
import { GetFavoriteMoviesSuccessEvent } from '../events/get-favorite-movies-success.event';
import { GetFavoriteMoviesFailureEvent } from '../events/get-favorite-movies-failure.event';

@Controller('/favorite-movie/stream')
export class FavoriteMovieSseController {
  constructor(private readonly eventBus: EventBus) {}
  @Sse('/add')
  addFavoriteMove(
    @Query('queryId') queryId?: string,
  ): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(AddFavoriteMovieSuccessEvent, AddFavoriteMovieFailureEvent),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof AddFavoriteMovieSuccessEvent
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

  @Sse('/remove')
  removeFavoriteMovie(
    @Query('queryId') queryId?: string,
  ): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(RemoveFavoriteMovieSuccessEvent, RemoveFavoriteMovieFailureEvent),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof RemoveFavoriteMovieSuccessEvent
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

  @Sse('/get-all')
  getAllFavoriteMovies(
    @Query('queryId') queryId?: string,
  ): Observable<MessageEvent> {
    return this.eventBus.pipe(
      ofType(GetFavoriteMoviesSuccessEvent, GetFavoriteMoviesFailureEvent),
      filter((event) => !queryId || event.queryId === queryId),
      map((event) =>
        event instanceof GetFavoriteMoviesSuccessEvent
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
