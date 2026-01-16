import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, ActivityModule],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*
  We should add tests for all the methods of the service
  */
});
