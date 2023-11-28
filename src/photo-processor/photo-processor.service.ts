import { Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { Photo } from 'src/photo.model/photo.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Processor('photo')
export class PhotoProcessor {
  private readonly logger = new Logger(PhotoProcessor.name);

  constructor(
    @InjectQueue('photo') private readonly photoQueue: Queue,
    @InjectModel(Photo.name) private readonly photoModel: Model<Photo>,
  ) {}
  @Process()
  async handleProcessPhoto(job: any) {
    try {
      const { data } = job;

      if (!data || !data.filePath) {
        throw new Error('Invalid data');
      }

      this.logger.log('File in handleProcessPhoto:', data.filePath);

      await this.processPhoto(data.filePath);

      return {
        status: 'File received, processing in the background',
      };
    } catch (error) {
      this.logger.error('Error processing photo:', error);
      throw error;
    }
  }

  async processPhoto(filePath: string): Promise<void> {
    try {
      this.logger.log('Processing photo:', filePath);

      const photo = new this.photoModel({ path: filePath });
      await photo.save();

      this.logger.log('Photo saved to database:', photo);
    } catch (error) {
      this.logger.error('Error processing photo:', error);
      throw error;
    }
  }
}
