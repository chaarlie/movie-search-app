import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { Movie } from 'src/types';
import { SemanticSearchMovieQuery } from '../semantic-search-movie.query';
import { EmbeddingsService } from 'src/ai/embedding.service';

@QueryHandler(SemanticSearchMovieQuery)
export class SemanticSearchMovieQueryHandler
  implements ICommandHandler<SemanticSearchMovieQuery>
{
  constructor(private readonly embeddingService: EmbeddingsService) {}

  // returns a list of at most 10 movie objects sorted by cosine similarity
  async execute({ query, movies }: SemanticSearchMovieQuery): Promise<Movie[]> {
    const rankedMovies = await this.embeddingService.semanticSearch(
      query,
      movies,
      10,
    );
    return rankedMovies;
  }
}
