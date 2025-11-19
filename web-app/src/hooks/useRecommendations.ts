import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useSSE } from "./useSSE";
import { Movie } from "../types";

export function useRecommendations(autoFetch: boolean = false) {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchRecommendations = useCallback(async () => {
    const newQueryId = `rec-${Date.now()}`;

    try {
      await axios.get(`${apiUrl}/movie/recommendations`, {
        params: { queryId: newQueryId },
      });

      setQueryId(newQueryId);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      throw error;
    }
  }, [apiUrl]);

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/movie/stream/recommendations`,
    queryId
  );

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [autoFetch, fetchRecommendations]);

  return {
    recommendations: data,
    error,
    isLoading,
    refetch: fetchRecommendations,
  };
}
