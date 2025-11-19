import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../src/movie/services/movie.service';
import axios from 'axios';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchMoviesHandler } from '../src/movie/queries/handlers/movies-search.handler';
import { ConfigService } from '@nestjs/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MoviesService', () => {
  let service: MoviesService;
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  // ✅ Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OMDB_API_KEY') return 'fake-api-key';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        MoviesService,
        SearchMoviesHandler,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated and deduplicated movies for valid query', async () => {
    const mockResponse = {
      data: {
        Search: [
          {
            imdbID: 'tt2975590',
            Title: 'Batman v Superman',
            Year: '2016',
            Poster: 'poster1.jpg',
          },
          {
            imdbID: 'tt2975590', // duplicate
            Title: 'Batman v Superman',
            Year: '2016',
            Poster: 'poster1.jpg',
          },
          {
            imdbID: 'tt0372784',
            Title: 'Batman Begins',
            Year: '2005',
            Poster: 'poster2.jpg',
          },
        ],
        totalResults: '30',
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await service.search('batman', 1, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(
        'http://www.omdbapi.com/?s=batman&page=1&apikey=fake-api-key',
      ),
    );

    expect(result).toEqual({
      movies: [
        {
          imdbID: 'tt2975590',
          Title: 'Batman v Superman',
          Year: '2016',
          Poster: 'poster1.jpg',
        },
        {
          imdbID: 'tt0372784',
          Title: 'Batman Begins',
          Year: '2005',
          Poster: 'poster2.jpg',
        },
      ],
      totalResults: 30,
      currentPage: 1,
      totalPages: 3,
    });
  });

  it('should handle empty search results', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { Search: [], totalResults: '0' },
    });

    const result = await service.search('unknown', 1, 10);

    expect(result).toEqual({
      movies: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
    });
  });

  it('should throw error on API failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API error'));

    await expect(service.search('batman')).rejects.toThrow(
      'Failed to search movies',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'OMDb API error:',
      'API error',
      undefined,
    );
  });
});
