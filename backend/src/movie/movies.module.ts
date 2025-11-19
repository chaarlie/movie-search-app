import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MovieRestController } from './controllers/movie-rest.controller';
import { MovieService } from './services/movie.service';
import { AIModule } from 'src/ai/ai.module';
import { FavoritesModule } from 'src/favorite-movie/favorites.module';
import { MovieSearchProcessor } from './processors/movie-search.processor';
import { MovieSseController } from './controllers/movie-sse.controller';
import { SearchMovieQueryHandler } from './query/handlers/search-movie-query.handler';
import { SemanticSearchMovieQueryHandler } from './query/handlers/semantic-search-movie-query.handler';
import { GetMovieRecommendationsQueryHandler } from './query/handlers/get-movie-recommendations-query.handler';
import { GetSuggestedMovieTitlesQueryHandler } from './query/handlers/get-suggested-movie-titles-query.handler';

@Module({
  imports: [
    CqrsModule,
    AIModule,
    FavoritesModule,
    BullModule.registerQueue({
      name: 'movie',
    }),
  ],
  controllers: [MovieRestController, MovieSseController],
  providers: [
    MovieService,
    GetMovieRecommendationsQueryHandler,
    SemanticSearchMovieQueryHandler,
    GetSuggestedMovieTitlesQueryHandler,
    SearchMovieQueryHandler,
    MovieSearchProcessor,
  ],
  exports: [MovieService],
})
export class MoviesModule {}
