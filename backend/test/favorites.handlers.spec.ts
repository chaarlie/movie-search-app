import { Test, TestingModule } from '@nestjs/testing';
import { AddFavoriteHandler } from '../src/favorite-movie/commands/handlers/add-favorite-command.handler';
import { RemoveFavoriteHandler } from '../src/favorite-movie/commands/handlers/remove-favorite-command.handler';
import { GetFavoritesHandler } from '../src/favorite-movie/queries/handlers/get-favorites.handler';
import { FavoritesService } from '../src/favorite-movie/services/favorites.service';
import { AddFavoriteCommand } from '../src/favorite-movie/commands/add-favorite.command';
import { RemoveFavoriteCommand } from '../src/favorite-movie/commands/remove-favorite.command';
import { GetFavoritesQuery } from '../src/favorite-movie/queries/get-favorite-movies.query';
import { Movie } from '../src/types';

describe('Favorites Handlers', () => {
  let addHandler: AddFavoriteHandler;
  let removeHandler: RemoveFavoriteHandler;
  let getHandler: GetFavoritesHandler;
  let favoritesService: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddFavoriteHandler,
        RemoveFavoriteHandler,
        GetFavoritesHandler,
        {
          provide: FavoritesService,
          useValue: {
            add: jest.fn(),
            remove: jest.fn(),
            getAll: jest.fn(),
          },
        },
      ],
    }).compile();

    addHandler = module.get<AddFavoriteHandler>(AddFavoriteHandler);
    removeHandler = module.get<RemoveFavoriteHandler>(RemoveFavoriteHandler);
    getHandler = module.get<GetFavoritesHandler>(GetFavoritesHandler);
    favoritesService = module.get<FavoritesService>(FavoritesService);
  });

  describe('AddFavoriteHandler', () => {
    it('should call FavoritesService.add', async () => {
      const movie: Movie = {
        imdbID: 'tt0372784',
        Title: 'Batman Begins',
        Year: '2005',
        Poster: 'poster.jpg',
      };
      jest.spyOn(favoritesService, 'add').mockImplementation(() => {});
      const command = new AddFavoriteCommand(movie);
      await addHandler.execute(command);

      expect(favoritesService.add).toHaveBeenCalledWith(movie);
    });
  });

  describe('RemoveFavoriteHandler', () => {
    it('should call FavoritesService.remove', async () => {
      jest.spyOn(favoritesService, 'remove').mockImplementation(() => {});
      const command = new RemoveFavoriteCommand('tt0372784');
      await removeHandler.execute(command);

      expect(favoritesService.remove).toHaveBeenCalledWith('tt0372784');
    });
  });

  describe('GetFavoritesHandler', () => {
    it('should call FavoritesService.getAll', async () => {
      const favorites: Movie[] = [
        {
          imdbID: 'tt0372784',
          Title: 'Batman Begins',
          Year: '2005',
          Poster: 'poster.jpg',
        },
      ];
      jest.spyOn(favoritesService, 'getAll').mockReturnValue(favorites);

      const query = new GetFavoritesQuery();
      const result = await getHandler.execute();

      expect(favoritesService.getAll).toHaveBeenCalled();
      expect(result).toEqual(favorites);
    });
  });
});
