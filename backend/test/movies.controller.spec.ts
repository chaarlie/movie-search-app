import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { MoviesController } from '../src/movie/controllers/movie-rest.controller';
import { SearchMoviesQuery } from '../src/movie/queries/movies-search.query';

describe('MoviesController', () => {
  let controller: MoviesController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call QueryBus with SearchMoviesQuery', async () => {
    const mockResult = {
      movies: [
        {
          imdbID: 'tt0372784',
          Title: 'Batman Begins',
          Year: '2005',
          Poster: 'poster.jpg',
        },
      ],
      totalResults: 1,
      currentPage: 1,
      totalPages: 1,
    };
    jest.spyOn(queryBus, 'execute').mockResolvedValue(mockResult);

    const result = await controller.search('batman', '1', '10');

    expect(queryBus.execute).toHaveBeenCalledWith(
      new SearchMoviesQuery('batman', 1, 10),
    );
    expect(result).toEqual(mockResult);
  });
});
