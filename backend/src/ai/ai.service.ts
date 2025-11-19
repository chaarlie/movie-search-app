import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { SearchParams } from './dto/search-params.dto';
import { Movie } from 'src/types';

@Injectable()
export class AIService {
  private client: BedrockRuntimeClient;

  constructor(private configService: ConfigService) {
    this.client = new BedrockRuntimeClient({
      region: this.configService.get('AWS_REGION'),
    });
  }

  async parseNaturalLanguageQuery(userQuery: string): Promise<SearchParams> {
    const prompt = `
You are a movie search assistant. Convert this natural language query into structured search parameters.

User query: "${userQuery}"

Return JSON with these fields (all optional):
{
  "searchTerm": "string", // Main search keyword
  "year": "string", // YYYY or not required
  "confidence": 0.0-1.0 // How confident you are
}

Examples:
"batman movies" → {"searchTerm": "batman", "confidence": 0.9}
"90s action films" → {"searchTerm": "action", "year": "1990", "confidence": 0.8}
"recent comedies" → {"searchTerm": "comedy", "year": "2020", "confidence": 0.7}

Only return valid JSON, no explanation.`;

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const content = responseBody.content[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI parsing error:', error);
      // Fallback to simple search
      return { searchTerm: userQuery, confidence: 0.5 };
    }
  }

  async suggestMovieTitles(userQuery: string): Promise<string[]> {
    const prompt = `You are a movie expert. Based on this search query, suggest 8-10 specific movie TITLES that match what the user is looking for.

User query: "${userQuery}"

Consider:
- Genre/themes mentioned
- Time period (if specified)
- Style/mood
- Popular and well-known movies that fit

Return ONLY a JSON array of movie titles (just the title, no year):
["Movie Title 1", "Movie Title 2", "Movie Title 3", ...]

Examples:
Query: "funny 90s movies about friendship"
Response: ["Dumb and Dumber", "Wayne's World", "Bill and Ted's Excellent Adventure", "Tommy Boy", "Clerks", "Airheads", "PCU", "Reality Bites"]

Query: "dark superhero fighting crime"
Response: ["The Dark Knight", "Batman Begins", "Watchmen", "The Crow", "V for Vendetta", "Kick-Ass", "Dredd", "Sin City"]

Query: "classic detective mysteries"
Response: ["Chinatown", "The Maltese Falcon", "L.A. Confidential", "Vertigo", "Rear Window", "The Big Sleep", "Murder on the Orient Express", "The Third Man"]

Only return the JSON array, nothing else.`;

    try {
      const aiResponse = await this.invokeModel(prompt);

      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('Movie title suggestion error:', error);
      return [];
    }
  }

  async getRecommendations(favorites: Movie[]): Promise<string[]> {
    if (favorites.length === 0) return [];

    const favoriteTitles = favorites.map((m) => m.title).join(', ');

    const prompt = `Based on these favorite movies: ${favoriteTitles}

Suggest 5 similar movies the user would enjoy. Consider:
- Genre similarities
- Era/time period
- Director style
- Themes

Return ONLY a JSON array of movie titles:
["Movie 1", "Movie 2", "Movie 3", "Movie 4", "Movie 5"]`;

    try {
      const aiResponse = await this.invokeModel(prompt);
      const titles = JSON.parse(aiResponse);

      return titles;
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }

  async invokeModel(prompt: string): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    };

    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error) {
      console.error('Bedrock error:', error);
      throw new Error('AI service unavailable');
    }
  }
}
