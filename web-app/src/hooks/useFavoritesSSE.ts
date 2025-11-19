"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Movie, SSEEvent } from "../types";

export function useFavoritesSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const eventSource = new EventSource(`${apiUrl}/favorites/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        if (data.type === "heartbeat") {
          return; // No cache update needed
        }

        // Get current favorites from cache
        const currentFavorites: Movie[] | undefined = queryClient.getQueryData([
          "favorites",
        ]);

        if (data.type === "add" && data.movie) {
          if (!currentFavorites) {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            return;
          }
          if (
            !currentFavorites.some((fav) => fav.imdbID === data.movie!.imdbID)
          ) {
            queryClient.setQueryData(
              ["favorites"],
              [...currentFavorites, data.movie]
            );
          }
        } else if (data.type === "remove" && data.imdbID) {
          if (!currentFavorites) {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            return;
          }
          queryClient.setQueryData(
            ["favorites"],
            currentFavorites.filter((fav) => fav.imdbID !== data.imdbID)
          );
        } else {
          console.warn("Unexpected SSE event, invalidating favorites:", data);
          queryClient.invalidateQueries({ queryKey: ["favorites"] });
        }
      } catch (error) {
        console.error("SSE parse error:", error);
        queryClient.invalidateQueries({ queryKey: ["favorites"] });
      }
    };

    eventSource.onerror = () => {
      console.error("SSE error, reconnecting...");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}
