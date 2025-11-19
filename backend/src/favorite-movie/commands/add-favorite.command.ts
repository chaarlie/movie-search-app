import { Movie } from 'src/types';

export class AddFavoriteCommand {
  constructor(public readonly movie: Movie) {}
}
