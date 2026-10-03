import { Injectable, PipeTransform } from '@nestjs/common';

/** Trims and lower-cases `email` on any auth body before it reaches a service. */
@Injectable()
export class NormalizeEmailPipe implements PipeTransform<{ email?: string }> {
  transform(body: { email?: string }) {
    if (typeof body?.email === 'string') {
      body.email = body.email.trim().toLowerCase();
    }
    return body;
  }
}
