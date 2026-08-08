import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  async sendOtpEmail(to: string, code: string, purpose: 'verify' | 'reset') {
    const subject = purpose === 'verify' ? 'Verify your Coastly account' : 'Reset your Coastly password';
    const heading = purpose === 'verify' ? 'Confirm your email' : 'Reset your password';

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #12302C;">
        <h2>${heading}</h2>
        <p>Your code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p style="color: #666;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY ?? '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Coastly', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`FAILED to send ${purpose} OTP to ${to}: ${res.status} ${body}`);
      throw new Error('Could not send email.');
    }

    this.logger.log(`Sent ${purpose} OTP to ${to}`);
  }
}
