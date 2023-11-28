import { Injectable } from '@nestjs/common';
import { InjectQueue, Process } from '@nestjs/bull';
import { Queue } from 'bull';
import { Photo } from 'src/photo.model/photo.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PhotoProcessor {
  constructor(
    @InjectQueue('photo') private readonly photoQueue: Queue,
    @InjectModel(Photo.name) private readonly photoModel: Model<Photo>,
  ) {}

  @Process('photo')
  async processPhoto(data: { filePath: string }): Promise<void> {
    try {
      const { filePath } = data;
      const photo = new this.photoModel({ path: filePath });
      await photo.save();
      console.log('Photo saved to database:', photo);
    } catch (error) {
      console.error('Error processing photo:', error);
      throw error;
    }
  }
}
