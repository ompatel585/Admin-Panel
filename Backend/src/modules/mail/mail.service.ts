import { Injectable, Logger } from '@nestjs/common';

/**
 * Outgoing mail boundary. No SMTP provider is wired up yet, so messages are
 * written to the server log; swap the body of these methods for a real
 * transport and nothing else has to change.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  sendPasswordReset(email: string, resetUrl: string): void {
    this.logger.log(`Password reset for ${email}: ${resetUrl}`);
  }
}
