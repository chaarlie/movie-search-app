import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie } from "../types";

export function useFavorites() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [EventTypes.GET_FAVORITES_SUCCESS, EventTypes.GET_FAVORITES_FAILURE],
    []
  );

  const { data, error, isLoading } = useUnifiedSSE<Movie[]>(
    eventTypes,
    queryId,
    {
      onSuccess: () => setIsFetching(false),
      onError: () => setIsFetching(false),
    }
  );

  const refetch = useCallback(async () => {
    const newQueryId = `get-favs-${Date.now()}`;
    setQueryId(newQueryId);
    setIsFetching(true);

    try {
      await axios.get(`${apiUrl}/favorite-movie`, {
        params: { queryId: newQueryId },
      });
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setIsFetching(false);
      throw error;
    }
  }, [apiUrl]);

  return {
    favorites: data || [],
    error,
    isLoading: isFetching || isLoading,
    refetch,
  };
}
