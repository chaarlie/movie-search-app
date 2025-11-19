import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FavoritesService } from '../src/favorite-movie/services/favorites.service';
import { Movie } from '../src/types';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    // Reset favorites array to avoid state leakage
    (service as any).favorites = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a favorite and emit event', () => {
    const movie: Movie = {
      imdbID: 'tt0372784',
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    };
    const emitSpy = jest.spyOn(eventEmitter, 'emit');
    service.add(movie);

    expect(emitSpy).toHaveBeenCalledWith('favorites.updated', {
      type: 'add',
      movie,
    });
    expect(service.getAll()).toContainEqual(movie);
  });

  it('should not add duplicate favorite', () => {
    const movie: Movie = {
      imdbID: 'tt0372784',
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    };
    const emitSpy = jest.spyOn(eventEmitter, 'emit');
    service.add(movie);
    service.add(movie);

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(service.getAll().length).toBe(1);
  });

  it('should remove a favorite and emit event', () => {
    const movie: Movie = {
      imdbID: 'tt0372784',
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    };
    const emitSpy = jest.spyOn(eventEmitter, 'emit');
    service.add(movie);
    service.remove('tt0372784');

    expect(emitSpy).toHaveBeenCalledWith('favorites.updated', {
      type: 'remove',
      imdbID: 'tt0372784',
    });
    expect(service.getAll()).not.toContainEqual(movie);
  });

  it('should list favorites', () => {
    const movie: Movie = {
      imdbID: 'tt0372784',
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    };
    service.add(movie);

    const favorites = service.getAll();
    expect(favorites).toEqual([movie]);
  });

  it('should not add invalid movie (missing imdbID)', () => {
    const invalidMovie = {
      Title: 'Batman Begins',
      Year: '2005',
      Poster: 'poster.jpg',
    } as Movie;
    const emitSpy = jest.spyOn(eventEmitter, 'emit');
    service.add(invalidMovie);

    expect(emitSpy).not.toHaveBeenCalled();
    expect(service.getAll()).toEqual([]);
  });
});
