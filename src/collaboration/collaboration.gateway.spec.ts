import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';

describe('CollaborationGateway', () => {
  let gateway: CollaborationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaborationGateway, CollaborationService],
    }).compile();

    gateway = module.get<CollaborationGateway>(CollaborationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
