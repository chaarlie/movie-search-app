import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie } from "../types";

export function useSemanticMovieSearch() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [
      EventTypes.SEMANTIC_SEARCH_SUCCESS,
      EventTypes.SEMANTIC_SEARCH_FAILURE,
    ],
    []
  );

  const { data, error, isLoading, setIsLoading } = useUnifiedSSE<Movie[]>(
    eventTypes,
    queryId
  );

  const search = useCallback(
    async (query: string) => {
      const newQueryId = `semantic-search-${Date.now()}`;
      setQueryId(newQueryId);
      setIsLoading(true);

      try {
        await axios.get(`${apiUrl}/movie/semantic-search`, {
          params: { query, queryId: newQueryId },
        });
      } catch (error) {
        console.error("Failed to start semantic search:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [apiUrl, setIsLoading]
  );

  return {
    search,
    data: data || [],
    error,
    isLoading,
  };
}
