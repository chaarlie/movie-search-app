import { Controller, Get, Query } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('/movie')
export class MovieRestController {
  constructor(@InjectQueue('movie') private moviesQueue: Queue) {}

  @Get('/search')
  async search(
    @Query('query') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('queryId') queryId?: string,
  ) {
    await this.moviesQueue.add('movie-search', {
      queryId,
      query,
      filters: {
        page,
        limit,
      },
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }

  @Get('/semantic-search')
  async semanticSearch(
    @Query('query') query: string,
    @Query('queryId') queryId?: string,
  ) {
    await this.moviesQueue.add('semantic-movie-search', {
      queryId,
      query,
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }

  @Get('/recommendations')
  async recommendations(@Query('queryId') queryId?: string) {
    await this.moviesQueue.add('movie-recommendations', {
      queryId,
    });

    return {
      queryId,
      status: 'queued',
      message: 'Query started. Listen via SSE.',
    };
  }
}
