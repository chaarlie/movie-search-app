import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Movie } from 'src/types';

@Injectable()
export class EmbeddingsService {
  private cache = new Map<string, number[]>();
  private client: BedrockRuntimeClient;

  constructor(private configService: ConfigService) {
    this.client = new BedrockRuntimeClient({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.cache.has(text)) return this.cache.get(text) || [];

    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-embed-text-v2:0',
      body: JSON.stringify({
        inputText: text,
      }),
    });

    const response = await this.client.send(command);
    const data = JSON.parse(new TextDecoder().decode(response.body));
    const embedding = data.embedding;

    this.cache.set(text, embedding);
    return embedding;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }

  async semanticSearch(
    query: string,
    movies: Movie[],
    topK = 10,
  ): Promise<Movie[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const moviesWithScores = await Promise.all(
      movies.map(async (movie) => {
        const movieText = `${movie.title} ${movie.year} ${movie.type}`;
        const movieEmbedding = await this.generateEmbedding(movieText);
        const score = this.cosineSimilarity(queryEmbedding, movieEmbedding);
        return { movie, score };
      }),
    );

    return moviesWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ movie }) => movie);
  }
}
