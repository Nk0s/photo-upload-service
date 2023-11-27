import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
  async saveFile(file) {
    if (!file.buffer || !(file.buffer instanceof Buffer)) {
      throw new Error('Invalid file buffer');
    }

    const filePath = join(__dirname, '/uploads', file.originalname);
    await this.writeFile(filePath, file.buffer);
    return { fileName: file.originalname, filePath };
  }

  private async writeFile(filePath: string, buffer: Buffer): Promise<void> {
    await fsPromises.writeFile(filePath, buffer);
  }
}

