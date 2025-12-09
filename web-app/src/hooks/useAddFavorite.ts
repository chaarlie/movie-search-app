import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie } from "../types";

export function useAddFavorite() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [EventTypes.ADD_FAVORITE_SUCCESS, EventTypes.ADD_FAVORITE_FAILURE],
    []
  );

  const { data, error, isLoading, setIsLoading } = useUnifiedSSE<Movie[]>(
    eventTypes,
    queryId
  );

  const addFavorite = useCallback(
    async (movie: Movie) => {
      const newQueryId = `add-fav-${Date.now()}`;
      setQueryId(newQueryId);
      setIsLoading(true);

      try {
        await axios.post(
          `${apiUrl}/favorite-movie`,
          { movie },
          {
            params: { queryId: newQueryId },
          }
        );
      } catch (error) {
        console.error("Failed to add favorite:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [apiUrl, setIsLoading]
  );

  return {
    addFavorite,
    updatedFavorites: data || [],
    error,
    isLoading,
  };
}
