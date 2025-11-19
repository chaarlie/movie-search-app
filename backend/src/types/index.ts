export interface Movie {
  imdbID: string;
  title: string;
  type: string;
  year: string;
  poster: string;
}

export interface SSEEvent {
  type: 'add' | 'remove';
  movie?: Movie;
  imdbID?: string;
}

export interface SearchResponse {
  movies: Movie[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}
