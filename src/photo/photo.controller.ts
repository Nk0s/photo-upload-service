import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|bmp|tiff|webp|eps|)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    await this.photoService.saveFile(file);
    return 'Photo uploaded!';
  }
}
