import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Photo } from '../photo.model/photo.model';
import { join } from 'path';
import { createWriteStream } from 'fs';

@Injectable()
export class PhotoService {
  constructor(
    @InjectModel(Photo.name) private readonly photoModel: Model<Photo>,
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

    const savedFile = new this.photoModel({ path: filePath });
    await savedFile.save();
  }
}
