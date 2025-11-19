import { MouseEvent } from "react";
import { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onAdd?: (movie: Movie) => void;
  onRemove?: (imdbID: string) => void;
  isFavorite: boolean;
  isLoading?: boolean;
}

export default function MovieCard({
  movie,
  onAdd,
  onRemove,
  isFavorite,
  isLoading = false,
}: MovieCardProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>, movie: Movie) => {
    e.preventDefault();
    if (isLoading) return;

    if (isFavorite && onRemove) {
      onRemove(movie.imdbID);
    } else if (onAdd) {
      onAdd(movie);
    }
  };

  return (
    <div className="border rounded-md p-4 shadow-md">
      <img
        src={
          movie.poster !== "N/A"
            ? movie.poster
            : "https://via.placeholder.com/150"
        }
        alt={movie.title}
        className="w-full h-64 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{movie.title}</h3>
      <p className="text-gray-600">{movie.year}</p>
      <button
        onClick={(e) => handleClick(e, movie)}
        disabled={isLoading}
        className={`mt-2 w-full p-2 rounded-md transition-colors ${
          isFavorite
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading
          ? "Processing..."
          : isFavorite
          ? "Remove from Favorites"
          : "Add to Favorites"}
      </button>
    </div>
  );
}
