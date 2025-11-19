import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { CreateFavoriteDto } from 'src/dto/create-favorite.dto';

@Controller('/favorite-movie')
export class FavoriteMovieRestController {
  constructor(
    @InjectQueue('favorite-movie') private favoriteMovieQueue: Queue,
  ) {}

  @Post()
  async addFavoriteMovie(
    @Body() { movie }: CreateFavoriteDto,
    @Query('queryId') queryId?: string,
  ) {
    await this.favoriteMovieQueue.add('add-favorite-movie', {
      queryId,
      movie,
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }

  @Delete(':imdbID')
  async remove(@Param('imdbID') imdbID: string, queryId?: string) {
    await this.favoriteMovieQueue.add('remove-favorite-movie', {
      queryId,
      imdbID,
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }

  @Get()
  async getAll(queryId?: string) {
    await this.favoriteMovieQueue.add('get-all-favorite-movies', {
      queryId,
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }
}
