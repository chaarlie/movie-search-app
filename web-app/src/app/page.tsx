"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import Link from "next/link";
import { Movie } from "../types";
import ErrorBoundary from "../components/ErrorBoundary";
import { useMovieSearch } from "../hooks/useMovieSearch";
import { useSemanticMovieSearch } from "../hooks/useSemanticMovieSearch";
import { useAddFavorite } from "@/hooks/useAddFavorite";
import { useRemoveFavorite } from "@/hooks/useRemoveFavorite";

function SearchResults({
  searchQuery,
  useSemanticSearch,
}: {
  searchQuery: string;
  useSemanticSearch: boolean;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);

  // Regular search
  const {
    search: regularSearch,
    data: regularData,
    isLoading: regularLoading,
    error: regularError,
  } = useMovieSearch();

  // Semantic search (uses both Claude + Titan)
  const {
    search: semanticSearch,
    data: semanticData,
    isLoading: semanticLoading,
    error: semanticError,
  } = useSemanticMovieSearch();

  const { addFavorite, updatedFavorites } = useAddFavorite();
  const { removeFavorite } = useRemoveFavorite();
  const [processingMovieId, setProcessingMovieId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (searchQuery) {
      if (useSemanticSearch) {
        semanticSearch(searchQuery);
      } else {
        regularSearch(searchQuery, 1);
      }
    }
  }, [searchQuery, useSemanticSearch, regularSearch, semanticSearch]);

  useEffect(() => {
    const activeData = useSemanticSearch ? semanticData : regularData;
    if (activeData.length) {
      setMovies(activeData);
    }
    if (updatedFavorites.length) {
      setMovies(updatedFavorites);
    }
  }, [regularData, semanticData, updatedFavorites, useSemanticSearch]);

  const handleAddFavorite = async (movie: Movie) => {
    setProcessingMovieId(movie.imdbID);
    try {
      await addFavorite(movie);
      setTimeout(() => setProcessingMovieId(null), 1000);
    } catch (err) {
      setProcessingMovieId(null);
    }
  };

  const handleRemoveFavorite = async (imdbID: string) => {
    setProcessingMovieId(imdbID);
    try {
      await removeFavorite(imdbID);
      setTimeout(() => {
        setProcessingMovieId(null);
      }, 1000);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setProcessingMovieId(null);
    }
  };

  const isLoading = useSemanticSearch ? semanticLoading : regularLoading;
  const error = useSemanticSearch ? semanticError : regularError;

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600 mb-4"></div>
        {useSemanticSearch ? (
          <div className="space-y-3">
            <p className="text-gray-700 font-semibold text-lg">
              🧠 AI Processing Your Query
            </p>
            <div className="max-w-md mx-auto space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2 p-2 bg-purple-50 rounded">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Claude analyzing natural language...</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <span>Titan generating semantic embeddings...</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2 bg-green-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                <span>Ranking results by relevance...</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Searching movies...</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {/* AI Insights Banner */}
      {useSemanticSearch && movies.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-white rounded-full p-2 flex-shrink-0">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-1">
                ✨ AI-Powered Results
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-purple-700">Claude Sonnet 3.5</strong>{" "}
                understood your query and extracted key themes, then{" "}
                <strong className="text-blue-700">Amazon Titan</strong> ranked
                these {movies.length} movies by semantic similarity. Results are
                ordered by relevance, not just keyword matching!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie: Movie, index: number) => {
          return (
            <div key={movie.imdbID} className="relative">
              {/* Semantic Rank Badge */}
              {useSemanticSearch && index < 3 && (
                <div className="absolute -top-2 -left-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : "bg-orange-600"
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>
              )}
              <MovieCard
                movie={movie}
                onAdd={handleAddFavorite}
                onRemove={handleRemoveFavorite}
                isFavorite={updatedFavorites.some(
                  (fav) => fav.imdbID === movie.imdbID
                )}
                isLoading={processingMovieId === movie.imdbID}
              />
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {movies.length === 0 && !isLoading && (
        <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-600 text-lg mb-2">No movies found</p>
          <p className="text-gray-500 text-sm">
            {useSemanticSearch
              ? "Try rephrasing your query or use different keywords"
              : "Try a different search term"}
          </p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [useSemanticSearch, setUseSemanticSearch] = useState<boolean>(false);

  const handleSearch = (query: string, useSemantic: boolean) => {
    setSearchQuery(query);
    setUseSemanticSearch(useSemantic);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Movie Search</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                AWS Bedrock
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Claude 3.5 Sonnet
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Titan Embeddings
              </span>
            </div>
          </div>
          <Link
            href="/favorites"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
          >
            ❤️ View Favorites
          </Link>
        </div>
      </header>

      <SearchBar onSearch={handleSearch} initialValue={searchQuery} />

      <ErrorBoundary
        fallback={<p className="text-red-500 text-center">Error</p>}
      >
        <Suspense fallback={<p className="text-center p-4">Searching...</p>}>
          {searchQuery && (
            <SearchResults
              searchQuery={searchQuery}
              useSemanticSearch={useSemanticSearch}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
