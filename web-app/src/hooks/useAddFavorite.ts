import { Movie } from "@/types";
import axios from "axios";
import { useState, useCallback } from "react";
import { useSSE } from "./useSSE";

export function useAddFavorite() {
  const [isAdding, setIsAdding] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const addFavorite = useCallback(
    async (movie: Movie) => {
      try {
        setIsAdding(true);

        const response = await axios.post(`${apiUrl}/favorite-movie`, {
          movie,
        });
      } catch (error) {
        console.error("Failed to add favorite:", error);
        setIsAdding(false);
        throw error;
      }
    },
    [apiUrl]
  );

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/favorite-movie/stream/add`,
    "",
    {
      onSuccess: (data) => {
        setIsAdding(false);
      },
      onError: (error) => {
        console.error("Add favorite failed:", error);
        setIsAdding(false);
      },
    }
  );

  return {
    addFavorite,
    updatedFavorites: data || [],
    error,
    isLoading: isAdding || isLoading,
  };
}
