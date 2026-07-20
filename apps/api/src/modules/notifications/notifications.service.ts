import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { NotificationType } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter?: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Nodemailer SMTP email transporter initialized.');
    } else {
      this.logger.warn(
        'SMTP configurations (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) are not fully defined. Email notifications will be skipped.',
      );
    }
  }

  // ─── 1. Create Notification (DB + Email fallback) ───────────────────────
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    this.logger.log(`Created DB notification for user ${userId}: "${title}"`);

    // For critical events (e.g. post failures, expired tokens), trigger email
    const isCritical =
      type === NotificationType.POST_FAILED ||
      (type === NotificationType.SYSTEM &&
        (title.toLowerCase().includes('expired') || title.toLowerCase().includes('failed')));

    if (isCritical) {
      await this.sendEmailNotification(userId, title, message);
    }

    return notification;
  }

  // ─── Send Email Helper ───────────────────────────────────────────────────
  private async sendEmailNotification(userId: string, title: string, message: string) {
    if (!this.transporter) {
      this.logger.log(
        `Skipped sending email notification (SMTP not configured) for user ${userId}`,
      );
      return;
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user || !user.email) {
        this.logger.warn(`Could not send email: User ${userId} has no email address`);
        return;
      }

      const mailOptions = {
        from: `"InstaAI Automation" <${process.env.SMTP_FROM || 'noreply@instaai.dev'}>`,
        to: user.email,
        subject: `[ALERT] ${title}`,
        text: `Hello ${user.name || 'InstaAI User'},\n\nThis is an alert from your Instagram AI Automation platform:\n\n${message}\n\nBest regards,\nInstaAI Support Team`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d32f2f;">InstaAI Critical Alert</h2>
            <p>Hello ${user.name || 'InstaAI User'},</p>
            <p>This is an alert regarding your Instagram AI Automation account:</p>
            <blockquote style="background: #f5f5f5; padding: 15px; border-left: 5px solid #d32f2f; margin: 20px 0;">
              <strong>${title}</strong><br/>
              ${message}
            </blockquote>
            <p>Please log in to your dashboard to resolve this issue.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #888;">This is an automated notification. Please do not reply directly to this email.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email notification successfully sent to ${user.email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send email notification: ${err.message}`);
    }
  }

  // ─── 2. Fetch Notifications (Paginated) ──────────────────────────────────
  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ─── 3. Mark Single as Read ──────────────────────────────────────────────
  async markAsRead(userId: string, id: string) {
    const note = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new Error('Notification not found or access denied');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // ─── 4. Mark All as Read ─────────────────────────────────────────────────
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
