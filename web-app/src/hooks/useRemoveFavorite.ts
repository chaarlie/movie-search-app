import { Movie } from "@/types";
import axios from "axios";
import { useState, useCallback } from "react";
import { useSSE } from "./useSSE";

export function useRemoveFavorite() {
  const [isRemoving, setIsRemoving] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const removeFavorite = useCallback(
    async (imdbID: string) => {
      try {
        setIsRemoving(true);
        await axios.delete(`${apiUrl}/favorite-movie/${imdbID}`);
      } catch (error) {
        console.error("Failed to remove favorite:", error);
        setIsRemoving(false);
        throw error;
      }
    },
    [apiUrl]
  );

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/favorite-movie/stream/remove`,
    null,
    {
      onSuccess: (data) => {
        setIsRemoving(false);
      },
      onError: (error) => {
        console.error("Remove favorite failed:", error);
        setIsRemoving(false);
      },
    }
  );

  return {
    removeFavorite,
    updatedFavorites: data || [],
    error,
    isLoading: isRemoving || isLoading,
  };
}
