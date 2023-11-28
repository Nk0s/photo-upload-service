import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Photo } from './photo.model';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoProcessor } from 'src/photo/photo-processor';
import { InjectQueue } from '@nestjs/bull';

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
    console.log(`File saved locally: ${filePath}`);
    await this.photoQueue.add('photo', { filePath });
  }
}
