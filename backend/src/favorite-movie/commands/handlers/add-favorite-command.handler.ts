import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FavoritesService } from '../../services/favorites.service';
import { AddFavoriteCommand } from '../add-favorite.command';

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteCommandHandler
  implements ICommandHandler<AddFavoriteCommand>
{
  constructor(private readonly favoritesService: FavoritesService) {}

  async execute(command: AddFavoriteCommand): Promise<void> {
    return this.favoritesService.add(command.movie);
  }
}
