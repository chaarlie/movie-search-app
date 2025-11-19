import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FavoritesService } from '../../services/favorites.service';
import { RemoveFavoriteCommand } from '../remove-favorite.command';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteCommandHandler
  implements ICommandHandler<RemoveFavoriteCommand>
{
  constructor(private readonly favoritesService: FavoritesService) {}
  async execute({ imdbID }: RemoveFavoriteCommand): Promise<void> {
    this.favoritesService.remove(imdbID);
  }
}
