"use client";

import { useState } from "react";
import { Suspense } from "react";
import MovieCard from "../../components/MovieCard";
import Link from "next/link";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useRemoveFavorite } from "@/hooks/useRemoveFavorite";
import { useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Movie } from "@/types";

function FavoritesContent() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const {
    favorites: fetchedFavorites,
    isLoading,
    error,
    refetch,
  } = useFavorites();
  const { removeFavorite, updatedFavorites } = useRemoveFavorite();
  const [processingMovieId, setProcessingMovieId] = useState<string | null>(
    null
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (fetchedFavorites.length) {
      setFavorites(fetchedFavorites);
    }
    if (updatedFavorites.length) {
      setFavorites(updatedFavorites);
    }
  }, [fetchedFavorites, updatedFavorites]);

  const handleRemove = async (imdbID: string) => {
    setProcessingMovieId(imdbID);
    try {
      await removeFavorite(imdbID);
      setTimeout(() => {
        setProcessingMovieId(null);
      }, 1000);
    } catch (err) {
      console.error("Failed to remove:", err);
      setProcessingMovieId(null);
    }
  };

  if (isLoading) {
    return <p className="text-center p-4">Loading favorites...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Search
        </Link>
      </header>
      {favorites.length === 0 && <p>No favorite movies yet.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onRemove={() => handleRemove(movie.imdbID)}
            isFavorite={true}
            isLoading={processingMovieId === movie.imdbID}
          />
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ErrorBoundary
      fallback={
        <p className="text-red-500 text-center">Error loading favorites</p>
      }
    >
      <Suspense
        fallback={<p className="text-center p-4">Loading favorites...</p>}
      >
        <FavoritesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
