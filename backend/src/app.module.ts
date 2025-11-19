import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FavoritesModule } from './favorite-movie/favorites.module';
import { MoviesModule } from './movie/movies.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';

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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
