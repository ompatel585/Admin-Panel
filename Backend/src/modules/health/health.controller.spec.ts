import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  it('reports the API as healthy', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    expect(moduleRef.get(HealthController).check()).toEqual({
      success: true,
      message: 'API is healthy',
    });
  });
});
