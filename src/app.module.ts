import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express'; // Изменение импорта
import { diskStorage } from 'multer'; // Изменение импорта
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoModule } from './photo/photo.module';
import { FileService } from './file/file.service';
import { PhotoProcessor } from './photo-processor/photo-processor.service';
import { PhotoService } from './photo/photo.service';
import { Photo, PhotoSchema } from './photo.model/photo.model';

const environment = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${environment}`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const dbUri = `${process.env.DB_CONNECTION}://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;

        console.log('MongoDB URI:', dbUri);

        return {
          uri: dbUri,
          dbName: process.env.DB_DATABASE,
          tls: process.env.DB_TLS === 'true',
        };
      },
    }),
    MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        timeout: 15000, //тест увелечение таймаута
      },
    }),
    BullModule.registerQueue({
      name: 'photo',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    PhotoModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Политика фильтрации файлов, например, проверка расширений(хз зачем решил потестить)
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
  controllers: [AppController],
  providers: [AppService, FileService, PhotoProcessor, PhotoService],
})
export class AppModule {}
