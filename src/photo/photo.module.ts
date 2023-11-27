import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Photo, PhotoSchema } from '../photo.model/photo.model';
import { PhotoProcessor } from 'src/photo-processor/photo-processor.service';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'photo',
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
  ],
  controllers: [PhotoController],
  providers: [PhotoService, PhotoProcessor, FileService],
})
export class PhotoModule {}

