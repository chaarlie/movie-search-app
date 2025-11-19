import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { FavoritesService } from './services/favorites.service';
import { RemoveFavoriteCommandHandler } from './commands/handlers/remove-favorite-command.handler';
import { AddFavoriteCommandHandler } from './commands/handlers/add-favorite-command.handler';
import { GetFavoriteMoviesQueryHandler } from './queries/handlers/get-favorite-movies-query.handler';
import { FavoriteMovieProcessor } from './processors/movie-search.processor';
import { FavoriteMovieRestController } from './controllers/favorite-movie-rest.controller';
import { FavoriteMovieSseController } from './controllers/favorite-movie-sse.controller';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'favorite-movie',
    }),
  ],
  controllers: [FavoriteMovieRestController, FavoriteMovieSseController],
  providers: [
    FavoritesService,
    FavoriteMovieProcessor,
    GetFavoriteMoviesQueryHandler,
    AddFavoriteCommandHandler,
    RemoveFavoriteCommandHandler,
  ],
  exports: [FavoritesService],
})
export class FavoritesModule {}
