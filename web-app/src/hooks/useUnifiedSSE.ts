import { useEffect, useRef, useCallback, useState } from "react";

// Event types that match the backend
export const EventTypes = {
  MOVIE_SEARCH_SUCCESS: "MOVIE_SEARCH_SUCCESS",
  MOVIE_SEARCH_FAILURE: "MOVIE_SEARCH_FAILURE",
  SEMANTIC_SEARCH_SUCCESS: "SEMANTIC_SEARCH_SUCCESS",
  SEMANTIC_SEARCH_FAILURE: "SEMANTIC_SEARCH_FAILURE",
  RECOMMENDATIONS_SUCCESS: "RECOMMENDATIONS_SUCCESS",
  RECOMMENDATIONS_FAILURE: "RECOMMENDATIONS_FAILURE",
  ADD_FAVORITE_SUCCESS: "ADD_FAVORITE_SUCCESS",
  ADD_FAVORITE_FAILURE: "ADD_FAVORITE_FAILURE",
  REMOVE_FAVORITE_SUCCESS: "REMOVE_FAVORITE_SUCCESS",
  REMOVE_FAVORITE_FAILURE: "REMOVE_FAVORITE_FAILURE",
  GET_FAVORITES_SUCCESS: "GET_FAVORITES_SUCCESS",
  GET_FAVORITES_FAILURE: "GET_FAVORITES_FAILURE",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export interface SSEEvent<T = unknown> {
  type: EventType;
  status: "success" | "failure";
  queryId: string;
  data?: T;
  error?: string;
  duration?: number;
}

type EventHandler<T = unknown> = (event: SSEEvent<T>) => void;

interface Subscription {
  queryId: string;
  eventTypes: EventType[];
  handler: EventHandler;
}

/**
 * Singleton SSE connection manager
 * Maintains a single connection to the server and routes events to subscribers
 */
class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  private connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    // Close existing connection if any
    this.disconnect();

    const url = `${this.apiUrl}/stream`;
    console.log("🔌 SSE: Connecting to", url);

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log("✅ SSE: Connected");
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log(
          "📨 SSE: Received",
          data.type,
          "for queryId:",
          data.queryId
        );
        this.routeEvent(data);
      } catch (error) {
        console.error("❌ SSE: Failed to parse event", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("❌ SSE: Connection error", error);
      this.handleReconnect();
    };
  }

  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ SSE: Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 SSE: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.subscriptions.size > 0) {
        this.connect();
      }
    }, delay);
  }

  private routeEvent(event: SSEEvent): void {
    this.subscriptions.forEach((subscription) => {
      const queryIdMatch =
        !subscription.queryId || subscription.queryId === event.queryId;
      const typeMatch = subscription.eventTypes.includes(event.type);

      if (queryIdMatch && typeMatch) {
        subscription.handler(event);
      }
    });
  }

  subscribe(
    subscriptionId: string,
    queryId: string,
    eventTypes: EventType[],
    handler: EventHandler
  ): void {
    this.subscriptions.set(subscriptionId, { queryId, eventTypes, handler });

    if (this.subscriptions.size === 1) {
      this.connect();
    }
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);

    if (this.subscriptions.size === 0) {
      console.log("🔌 SSE: No subscribers, disconnecting");
      this.disconnect();
    }
  }

  updateSubscription(subscriptionId: string, queryId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.queryId = queryId;
    }
  }
}

/**
 * Hook to subscribe to specific SSE events
 */
export function useUnifiedSSE<T = unknown>(
  eventTypes: EventType[],
  queryId: string | null,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subscriptionIdRef = useRef<string>(
    `sub-${Date.now()}-${Math.random()}`
  );
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const manager = SSEConnectionManager.getInstance();
    const subscriptionId = subscriptionIdRef.current;

    const handler: EventHandler<T> = (event) => {
      if (event.status === "success") {
        setData(event.data as T);
        setIsLoading(false);
        setError(null);
        optionsRef.current.onSuccess?.(event.data as T);
      } else {
        setError(event.error || "Unknown error");
        setIsLoading(false);
        optionsRef.current.onError?.(event.error || "Unknown error");
      }
    };

    //@ts-ignore
    manager.subscribe(subscriptionId, queryId || "", eventTypes, handler);

    return () => {
      manager.unsubscribe(subscriptionId);
    };
  }, [eventTypes.join(",")]); // Only re-subscribe if event types change

  // Update queryId without re-subscribing
  useEffect(() => {
    if (queryId) {
      setIsLoading(true);
      setError(null);
      const manager = SSEConnectionManager.getInstance();
      manager.updateSubscription(subscriptionIdRef.current, queryId);
    }
  }, [queryId]);

  return { data, error, isLoading, setIsLoading };
}
