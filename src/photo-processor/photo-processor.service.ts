import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { Photo } from 'src/photo.model/photo.model';

@Injectable()
export class PhotoProcessor {
  constructor(@InjectQueue('photo') private readonly photoQueue: Queue) {}

  async handleProcessPhoto(file: any) {
    try {
      if (!file) {
        throw new Error('File is missing');
      }

      console.log('File in handleProcessPhoto:', file);

      if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
        throw new Error('Invalid file buffer');
      }

      const filePath = await this.saveFile(file);
      console.log('Saved file at path:', filePath);

      const photo = new Photo({ filePath });
      await photo.save();
      console.log('Photo saved to database:', photo);

      return {
        status: 'File received, processing in the background',
      };
    } catch (error) {
      console.error('Error processing photo:', error);
      throw error;
    }
  }

  private async saveFile(file: any): Promise<string> {
    if (!file.buffer || !(file.buffer instanceof Buffer)) {
      throw new Error('Invalid file buffer');
    }

    const filePath = join(__dirname, '..', 'uploads', file.originalname);
    await this.writeFile(filePath, file.buffer);
    return filePath;
  }

  private async writeFile(filePath: string, buffer: Buffer): Promise<void> {
    await fsPromises.writeFile(filePath, buffer);
  }
}