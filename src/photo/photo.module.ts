import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Photo, PhotoSchema } from '../photo.model/photo.model';
import { PhotoProcessor } from 'src/photo-processor/photo-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
    BullModule.registerQueue({
      name: 'photo',
    }),
  ],
  controllers: [PhotoController],
  providers: [PhotoProcessor, PhotoService],
})
export class PhotoModule {}
