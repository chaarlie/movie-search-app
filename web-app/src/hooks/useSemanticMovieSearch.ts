import { useState, useCallback } from "react";
import axios from "axios";
import { useSSE } from "./useSSE";
import { Movie } from "../types";

export function useSemanticMovieSearch() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const search = useCallback(
    async (query: string) => {
      const newQueryId = `semantic-search-${Date.now()}`;

      try {
        setIsSearching(true);

        await axios.get(`${apiUrl}/movie/semantic-search`, {
          params: { query, queryId: newQueryId },
        });

        setQueryId(newQueryId);
      } catch (error) {
        console.error("Failed to start semantic search:", error);
        setIsSearching(false);
        throw error;
      }
    },
    [apiUrl]
  );

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/movie/stream/semantic-search`,
    queryId,
    {
      onSuccess: (data) => {
        setIsSearching(false);
      },
      onError: (error) => {
        console.error("Semantic search failed:", error);
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
