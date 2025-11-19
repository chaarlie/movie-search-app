import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Movie, SearchResponse } from 'src/types';

@Injectable()
export class MovieService {
  private readonly OMDB_API_KEY: string;

  constructor(private configService: ConfigService) {
    this.OMDB_API_KEY = String(this.configService.get<string>('OMDB_API_KEY'));
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
    year: string | undefined = undefined,
  ): Promise<SearchResponse> {
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&${Number.isNaN(year) ? '' : `y=${year}&`}page=${page}&apikey=${this.OMDB_API_KEY}`,
      );
      const movies = response.data.Search || [];
      const totalResults = parseInt(response.data.totalResults || '0', 10);

      // Normalize and deduplicate by imdbID
      const uniqueMovies = Array.from(
        new Map(
          movies
            .filter(
              (el: {
                Title: string;
                Poster: string;
                Year: string;
                imdbID: string | undefined;
                Type: string;
              }) => !!el.imdbID,
            )
            .map(
              ({
                imdbID,
                Title: title,
                Year: year,
                Poster: poster,
                Type: type,
              }) => [
                imdbID.trim().toLowerCase(),
                {
                  title,
                  year,
                  poster,
                  type,
                  imdbID: imdbID.trim().toLowerCase(),
                },
              ],
            ),
        ).values(),
      ).slice(0, limit) as Movie[];

      return {
        movies: uniqueMovies,
        totalResults,
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
      };
    } catch (error) {
      console.error('OMDb API error:', error.message, error.response?.data);
      throw new Error('Failed to search movies');
    }
  }
}
