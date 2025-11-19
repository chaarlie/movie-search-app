export interface Movie {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
}

export interface SearchResponse {
  movies: Movie[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export interface SSEEvent {
  type: "add" | "remove" | "heartbeat";
  movie?: Movie;
  imdbID?: string;
}
