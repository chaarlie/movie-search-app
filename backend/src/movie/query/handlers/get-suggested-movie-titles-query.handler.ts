import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { AIService } from 'src/ai/ai.service';
import { GetSuggestedMovieTitlesQuery } from '../get-suggested-movie-titles.query';

@QueryHandler(GetSuggestedMovieTitlesQuery)
export class GetSuggestedMovieTitlesQueryHandler
  implements ICommandHandler<GetSuggestedMovieTitlesQuery>
{
  constructor(private readonly aiService: AIService) {}

  async execute({ query }: GetSuggestedMovieTitlesQuery): Promise<string[]> {
    return this.aiService.suggestMovieTitles(query);
  }
}
