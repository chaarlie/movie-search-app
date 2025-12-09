import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUnifiedSSE, EventTypes } from "./useUnifiedSSE";
import { Movie } from "../types";

export function useRemoveFavorite() {
  const [queryId, setQueryId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const eventTypes = useMemo(
    () => [
      EventTypes.REMOVE_FAVORITE_SUCCESS,
      EventTypes.REMOVE_FAVORITE_FAILURE,
    ],
    []
  );

  const { data, error, isLoading, setIsLoading } = useUnifiedSSE<Movie[]>(
    eventTypes,
    queryId
  );

  const removeFavorite = useCallback(
    async (imdbID: string) => {
      const newQueryId = `remove-fav-${Date.now()}`;
      setQueryId(newQueryId);
      setIsLoading(true);

      try {
        await axios.delete(`${apiUrl}/favorite-movie/${imdbID}`, {
          params: { queryId: newQueryId },
        });
      } catch (error) {
        console.error("Failed to remove favorite:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [apiUrl, setIsLoading]
  );

  return {
    removeFavorite,
    updatedFavorites: data || [],
    error,
    isLoading,
  };
}
