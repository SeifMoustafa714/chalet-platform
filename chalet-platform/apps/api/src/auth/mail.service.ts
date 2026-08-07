import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendOtpEmail(to: string, code: string, purpose: 'verify' | 'reset') {
    const subject = purpose === 'verify' ? 'Verify your Coastly account' : 'Reset your Coastly password';
    const heading = purpose === 'verify' ? 'Confirm your email' : 'Reset your password';

    await this.transporter.sendMail({
      from: `"Coastly" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #12302C;">
          <h2>${heading}</h2>
          <p>Your code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
          <p style="color: #666;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  }
}
