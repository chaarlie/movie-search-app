import { Injectable } from '@nestjs/common';
import { Movie } from '../../types';

@Injectable()
export class FavoritesService {
  private favorites: Movie[] = [];

  add(movie: Movie): void {
    const requiredFields: (keyof Movie)[] = [
      'imdbID',
      'title',
      'year',
      'poster',
    ];
    const missingFields = requiredFields.filter((field) => !movie[field]);

    if (missingFields.length > 0) {
      console.warn(
        `Cannot add movie — missing required fields: ${missingFields.join(', ')}`,
      );
      return;
    }

    if (this.favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      return;
    }

    this.favorites.push(movie);
  }

  remove(imdbID: string): void {
    this.favorites = this.favorites.filter((fav) => fav.imdbID !== imdbID);
  }

  getAll(): Movie[] {
    return this.favorites;
  }
}
