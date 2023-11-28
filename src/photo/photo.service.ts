import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Photo } from '../photo.model/photo.model';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoProcessor } from 'src/photo-processor/photo-processor.service';

@Injectable()
export class PhotoService {
  constructor(
    @InjectQueue('photo') private readonly photoQueue: Queue,
    @InjectModel(Photo.name) private readonly photoModel: Model<Photo>,
    private readonly photoProcessor: PhotoProcessor,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<void> {
    const uploadDir = 'uploads';
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadDir, filename);

    await new Promise((resolve, reject) =>
      createWriteStream(filePath)
        .on('finish', () => resolve(filePath))
        .on('error', (error) => reject(error))
        .end(file.buffer),
    );

    await this.photoQueue.add('photo', { filePath });
    await this.savePhotoToDatabase(filePath);
  }

  private async savePhotoToDatabase(filePath: string): Promise<void> {
    await this.photoProcessor.processPhoto({ filePath });
    const savedFile = new this.photoModel({ path: filePath });
    await savedFile.save();
  }
}
