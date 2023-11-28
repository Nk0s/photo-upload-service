import { ConfigModule } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoProcessor } from './photo/photo-processor';
import { PhotoService } from './photo/photo.service';
import { Photo, PhotoSchema } from './photo/photo.model';
import { PhotoController } from './photo/photo.controller';

const environment = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${environment}`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: `${process.env.DB_CONNECTION}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`,
        dbName: process.env.DB_DATABASE,
        tls: process.env.DB_TLS === 'true',
      }),
    }),
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        timeout: 30000,
      },
    }),
    BullModule.registerQueue({
      name: 'photo',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6390,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/ico',
          'image/jpg',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  ],
  controllers: [AppController, PhotoController],
  providers: [AppService, PhotoProcessor, PhotoService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor() {
    this.logger.log(
      `Connected to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    );
  }
}
