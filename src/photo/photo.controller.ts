import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpStatus,
  HttpException,
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
        if (!file.originalname.match(/\.(jpg|jpeg|png|bmp|tiff|webp|eps)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
      await this.photoService.saveFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}
