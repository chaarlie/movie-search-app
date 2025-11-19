import { useState, useCallback } from "react";
import axios from "axios";
import { useSSE } from "./useSSE";
import { Movie } from "../types";

export function useFavorites() {
  const [isFetching, setIsFetching] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchFavorites = useCallback(async () => {
    try {
      setIsFetching(true);
      await axios.get(`${apiUrl}/favorite-movie`);

      setTimeout(() => {
        setIsFetching(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setIsFetching(false);
      throw error;
    }
  }, [apiUrl]);

  const { data, error, isLoading } = useSSE<Movie[]>(
    `${apiUrl}/favorite-movie/stream/get-all`,
    "",
    {
      onSuccess: (data) => {
        setIsFetching(false);
      },
      onError: (error) => {
        console.error("Fetch favorites failed:", error);
        setIsFetching(false);
      },
    }
  );

  return {
    favorites: data || [],
    error,
    isLoading: isFetching,
    refetch: fetchFavorites,
  };
}
