import { useState, useCallback } from "react";
import axios from "axios";
import { useSSE } from "./useSSE";
import { Movie, SearchResponse } from "../types";

export function useMovieSearch() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const search = useCallback(
    async (query: string, page: number = 1) => {
      const newQueryId = `search-${Date.now()}`;

      try {
        setIsSearching(true);

        await axios.get(`${apiUrl}/movie/search`, {
          params: { query, page, limit: 10, queryId: newQueryId },
        });

        setQueryId(newQueryId);
      } catch (error) {
        console.error("Failed to start search:", error);
        setIsSearching(false);
        throw error;
      }
    },
    [apiUrl]
  );

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/movie/stream/search`,
    queryId,
    {
      onSuccess: (data) => {
        setIsSearching(false);
      },
      onError: (error) => {
        console.error("Search failed:", error);
        setIsSearching(false);
      },
    }
  );

  return {
    search,
    data: data || [],
    error,
    isLoading: isSearching || isLoading,
  };
}
