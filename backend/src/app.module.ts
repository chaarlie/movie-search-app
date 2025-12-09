import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FavoritesModule } from './favorite-movie/favorites.module';
import { MoviesModule } from './movie/movies.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MoviesModule,
    FavoritesModule,
    StreamModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
