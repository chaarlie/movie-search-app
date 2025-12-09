import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UnifiedSseController } from './unified-sse.controller';

@Module({
  imports: [CqrsModule],
  controllers: [UnifiedSseController],
})
export class StreamModule {}
