import { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie } from "../types";

export function useRecommendations(autoFetch: boolean = false) {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [
      EventTypes.RECOMMENDATIONS_SUCCESS,
      EventTypes.RECOMMENDATIONS_FAILURE,
    ],
    []
  );

  const { data, error, isLoading, setIsLoading } = useUnifiedSSE<Movie[]>(
    eventTypes,
    queryId
  );

  const fetchRecommendations = useCallback(async () => {
    const newQueryId = `rec-${Date.now()}`;
    setQueryId(newQueryId);
    setIsLoading(true);

    try {
      await axios.get(`${apiUrl}/movie/recommendations`, {
        params: { queryId: newQueryId },
      });
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setIsLoading(false);
      throw error;
    }
  }, [apiUrl, setIsLoading]);

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
