import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { AppException } from '../../../common/exceptions/app.exception.js';
import type { AppConfig } from '../../../config/configuration.js';
import {
  JOB_ERRORS,
  PIPELINE_KEY_HEADER,
} from '../../crawl-jobs/constants/crawl-jobs.constants.js';

/** Machine-to-machine auth for the crawl/index pipeline: a shared secret in a header. */
@Injectable()
export class PipelineKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers[PIPELINE_KEY_HEADER];
    const expected = this.config.get('pipeline.apiKey', { infer: true });

    const a = Buffer.from(typeof provided === 'string' ? provided : '');
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new AppException(JOB_ERRORS.PIPELINE_KEY_INVALID);
    }
    return true;
  }
}
