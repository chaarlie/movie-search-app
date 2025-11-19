import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AIService } from './ai.service';
import { EmbeddingsService } from './embedding.service';

@Module({
  imports: [CqrsModule],
  providers: [AIService, EmbeddingsService],
  exports: [AIService, EmbeddingsService],
})
export class AIModule {}
