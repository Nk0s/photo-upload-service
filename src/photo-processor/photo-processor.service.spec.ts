import { Test, TestingModule } from '@nestjs/testing';
import { PhotoProcessorService } from './photo-processor.service';

describe('PhotoProcessorService', () => {
  let service: PhotoProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoProcessorService],
    }).compile();

    service = module.get<PhotoProcessorService>(PhotoProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
