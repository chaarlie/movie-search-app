import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsObject,
  IsString,
  Matches,
  IsUrl,
} from 'class-validator';

class MovieDto {
  @IsString()
  @Matches(/^tt\d{7,8}$/)
  imdbID: string;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  @Matches(/^\d{4}/)
  year: string;

  @IsUrl()
  poster: string;
}

export class CreateFavoriteDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MovieDto)
  movie: MovieDto;
}
