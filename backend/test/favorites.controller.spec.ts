import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FavoritesController } from '../src/favorite-movie/favorites.controller';
import { AddFavoriteCommand } from '../src/favorite-movie/commands/add-favorite.command';
import { RemoveFavoriteCommand } from '../src/favorite-movie/commands/remove-favorite.command';
import { GetFavoritesQuery } from '../src/favorite-movie/queries/get-favorite-movies.query';
import { Movie } from '../src/types';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add a favorite', async () => {
    const movie: Movie = {
      imdbID: 'tt0372784',
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    };
    jest.spyOn(commandBus, 'execute').mockResolvedValue(movie);

    const result = await controller.add({ movie });

    expect(commandBus.execute).toHaveBeenCalledWith(
      new AddFavoriteCommand(movie),
    );
    expect(result).toEqual(movie);
  });

  it('should remove a favorite', async () => {
    jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

    await controller.remove('tt0372784');

    expect(commandBus.execute).toHaveBeenCalledWith(
      new RemoveFavoriteCommand('tt0372784'),
    );
  });

  it('should list favorites', async () => {
    const favorites: Movie[] = [
      {
        imdbID: 'tt0372784',
        Title: 'Batman Begins',
        Year: '2005',
        Poster: 'poster.jpg',
      },
    ];
    jest.spyOn(queryBus, 'execute').mockResolvedValue(favorites);

    const result = await controller.list();

    expect(queryBus.execute).toHaveBeenCalledWith(new GetFavoritesQuery());
    expect(result).toEqual(favorites);
  });

  //   it('should handle SSE stream', async () => {
  //     const mockReq = { headers: { 'last-event-id': '' } };
  //     const mockRes = {
  //       write: jest.fn(),
  //       end: jest.fn(),
  //       setHeader: jest.fn(),
  //     };
  //     const mockObservable = { subscribe: jest.fn() };
  //     jest.spyOn(queryBus, 'execute').mockReturnValue(mockObservable);

  //     await controller.streamFavorites(mockReq, mockRes);

  //     expect(queryBus.execute).toHaveBeenCalledWith(new GetFavoritesQuery());
  //     expect(mockObservable.subscribe).toHaveBeenCalled();
  //   });
});
