import { Controller, Query, Sse } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Observable, filter, map } from 'rxjs';

// Movie Events
import { MovieSearchCompleteEvent } from '../movie/events/movie-search-complete.event';
import { MovieSearchFailedEvent } from '../movie/events/movie-search-failed.event';
import { SemanticMovieSearchCompleteEvent } from '../movie/events/semantic-movie-search-complete.event';
import { SemanticMovieSearchFailedEvent } from '../movie/events/semantic-movie-search-failed.event';
import { MovieRecommendationsCompleteEvent } from '../movie/events/movie-recommendetations-complete.event';
import { MovieRecommendationsFailedEvent } from '../movie/events/movie-recommendations-failed.event';

// Favorite Events
import { AddFavoriteMovieSuccessEvent } from '../favorite-movie/events/add-favorite-movie-success.event';
import { AddFavoriteMovieFailureEvent } from '../favorite-movie/events/add-favorite-movie-failure.event';
import { RemoveFavoriteMovieSuccessEvent } from '../favorite-movie/events/remove-favorite-movie-failure.event';
import { RemoveFavoriteMovieFailureEvent } from '../favorite-movie/events/remove-favorite-movie-success.event';
import { GetFavoriteMoviesSuccessEvent } from '../favorite-movie/events/get-favorite-movies-success.event';
import { GetFavoriteMoviesFailureEvent } from '../favorite-movie/events/get-favorite-movies-failure.event';

// Event type constants for the frontend
const EventTypes = {
  // Movie search
  MOVIE_SEARCH_SUCCESS: 'MOVIE_SEARCH_SUCCESS',
  MOVIE_SEARCH_FAILURE: 'MOVIE_SEARCH_FAILURE',
  SEMANTIC_SEARCH_SUCCESS: 'SEMANTIC_SEARCH_SUCCESS',
  SEMANTIC_SEARCH_FAILURE: 'SEMANTIC_SEARCH_FAILURE',
  RECOMMENDATIONS_SUCCESS: 'RECOMMENDATIONS_SUCCESS',
  RECOMMENDATIONS_FAILURE: 'RECOMMENDATIONS_FAILURE',
  // Favorites
  ADD_FAVORITE_SUCCESS: 'ADD_FAVORITE_SUCCESS',
  ADD_FAVORITE_FAILURE: 'ADD_FAVORITE_FAILURE',
  REMOVE_FAVORITE_SUCCESS: 'REMOVE_FAVORITE_SUCCESS',
  REMOVE_FAVORITE_FAILURE: 'REMOVE_FAVORITE_FAILURE',
  GET_FAVORITES_SUCCESS: 'GET_FAVORITES_SUCCESS',
  GET_FAVORITES_FAILURE: 'GET_FAVORITES_FAILURE',
} as const;

// All event classes we want to listen to
const ALL_EVENTS = [
  // Movie events
  MovieSearchCompleteEvent,
  MovieSearchFailedEvent,
  SemanticMovieSearchCompleteEvent,
  SemanticMovieSearchFailedEvent,
  MovieRecommendationsCompleteEvent,
  MovieRecommendationsFailedEvent,
  // Favorite events
  AddFavoriteMovieSuccessEvent,
  AddFavoriteMovieFailureEvent,
  RemoveFavoriteMovieSuccessEvent,
  RemoveFavoriteMovieFailureEvent,
  GetFavoriteMoviesSuccessEvent,
  GetFavoriteMoviesFailureEvent,
];

@Controller('/stream')
export class UnifiedSseController {
  constructor(private readonly eventBus: EventBus) {}

  /**
   * Single unified SSE endpoint for all events
   *
   * IMPORTANT: This broadcasts ALL events to ALL connected clients.
   * The frontend filters by queryId to only process relevant events.
   * This is necessary because each browser window needs to receive
   * events for its own queries.
   */
  @Sse()
  unifiedStream(): Observable<MessageEvent> {
    console.log('🔌 New SSE client connected');

    return this.eventBus.pipe(
      // Filter to only our known events
      filter((event): event is InstanceType<(typeof ALL_EVENTS)[number]> =>
        ALL_EVENTS.some((EventClass) => event instanceof EventClass),
      ),

      map((event) => {
        const response = this.mapEventToResponse(event);
        console.log(
          '📤 Broadcasting event:',
          response.type,
          'queryId:',
          response.queryId,
        );
        return { data: response } as MessageEvent;
      }),
    );
  }

  private mapEventToResponse(event: unknown): {
    type: string;
    status: 'success' | 'failure';
    queryId: string;
    data?: unknown;
    error?: string;
    duration?: number;
  } {
    // Movie Search Events
    if (event instanceof MovieSearchCompleteEvent) {
      return {
        type: EventTypes.MOVIE_SEARCH_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof MovieSearchFailedEvent) {
      return {
        type: EventTypes.MOVIE_SEARCH_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Semantic Search Events
    if (event instanceof SemanticMovieSearchCompleteEvent) {
      return {
        type: EventTypes.SEMANTIC_SEARCH_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof SemanticMovieSearchFailedEvent) {
      return {
        type: EventTypes.SEMANTIC_SEARCH_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Recommendations Events
    if (event instanceof MovieRecommendationsCompleteEvent) {
      return {
        type: EventTypes.RECOMMENDATIONS_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof MovieRecommendationsFailedEvent) {
      return {
        type: EventTypes.RECOMMENDATIONS_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Add Favorite Events
    if (event instanceof AddFavoriteMovieSuccessEvent) {
      return {
        type: EventTypes.ADD_FAVORITE_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof AddFavoriteMovieFailureEvent) {
      return {
        type: EventTypes.ADD_FAVORITE_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Remove Favorite Events
    if (event instanceof RemoveFavoriteMovieSuccessEvent) {
      return {
        type: EventTypes.REMOVE_FAVORITE_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof RemoveFavoriteMovieFailureEvent) {
      return {
        type: EventTypes.REMOVE_FAVORITE_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Get Favorites Events
    if (event instanceof GetFavoriteMoviesSuccessEvent) {
      return {
        type: EventTypes.GET_FAVORITES_SUCCESS,
        status: 'success',
        queryId: event.queryId,
        data: event.response,
        duration: event.durationMs,
      };
    }
    if (event instanceof GetFavoriteMoviesFailureEvent) {
      return {
        type: EventTypes.GET_FAVORITES_FAILURE,
        status: 'failure',
        queryId: event.queryId,
        error: event.message,
      };
    }

    // Fallback for unknown events
    return {
      type: 'UNKNOWN',
      status: 'failure',
      queryId: '',
      error: 'Unknown event type',
    };
  }
}
