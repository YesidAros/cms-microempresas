import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificacionesService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async enviarCorreo(
    destinatario: string,
    asunto: string,
    contenidoHtml: string,
    replyTo?: string,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
      to: destinatario,
      subject: asunto,
      html: contenidoHtml,
      replyTo,
    });
  }
}