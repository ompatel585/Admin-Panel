import { Injectable } from '@nestjs/common';
import type { HealthResponse } from './types/health-response.type.js';

@Injectable()
export class HealthService {
  check(): HealthResponse {
    return { success: true, message: 'API is healthy' };
  }
}
