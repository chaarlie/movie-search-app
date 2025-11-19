jest.mock('axios');
import axios from 'axios';

import { MoviesService } from '../src/movie/services/movie.service';
import { ConfigService } from '@nestjs/config';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(() => {
    service = new MoviesService(new ConfigService());
    jest.clearAllMocks();
  });

  it('should return normalized movie data', async () => {
    const mockAxiosResponse = {
      data: {
        Search: [
          {
            imdbID: 'tt0372784',
            Title: 'Batman Begins',
            Year: '2005',
            Poster: 'poster.jpg',
          },
        ],
        totalResults: '1',
      },
    };

    (axios.get as jest.Mock).mockResolvedValueOnce(mockAxiosResponse);

    const result = await service.search('batman', 1, 10);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('batman'));
    expect(result.movies[0].imdbID).toBe('tt0372784');
    expect(result.totalResults).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});
