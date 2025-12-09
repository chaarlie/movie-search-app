import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie, SearchResponse } from "../types";

export function useMovieSearch() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [EventTypes.MOVIE_SEARCH_SUCCESS, EventTypes.MOVIE_SEARCH_FAILURE],
    []
  );

  const { data, error, isLoading, setIsLoading } =
    useUnifiedSSE<SearchResponse>(eventTypes, queryId);

  const search = useCallback(
    async (query: string, page: number = 1) => {
      const newQueryId = `search-${Date.now()}`;
      setQueryId(newQueryId);
      setIsLoading(true);

      try {
        await axios.get(`${apiUrl}/movie/search`, {
          params: { query, page, limit: 10, queryId: newQueryId },
        });
      } catch (error) {
        console.error("Failed to start search:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [apiUrl, setIsLoading]
  );

  return {
    search,
    data: data?.movies || [],
    error,
    isLoading,
  };
}
