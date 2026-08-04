import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { AssetsModule } from './assets/assets.module';
import { FieldsModule } from './fields/fields.module';
import { LoansModule } from './loans/loans.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { VisitsModule } from './visits/visits.module';
import { SupabaseModule } from './supabase.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { getClientTracker, RateLimitRequest } from './rate-limit/client-tracker';
import { RATE_LIMIT_STORAGE, RateLimitModule } from './rate-limit/rate-limit.module';

@Module({
  imports: [
    RateLimitModule,
    ThrottlerModule.forRootAsync({
      imports: [RateLimitModule],
      inject: [RATE_LIMIT_STORAGE],
      useFactory: (storage: ThrottlerStorage) => ({
        throttlers: [{ ttl: 60_000, limit: 5 }],
        storage,
        getTracker: async (request: RateLimitRequest) => getClientTracker(request),
        errorMessage: 'Demasiados intentos. Intente nuevamente mas tarde.',
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    AssetsModule,
    FieldsModule,
    LoansModule,
    NotificationsModule,
    ReportsModule,
    VisitsModule,
    SupabaseModule,
    DashboardModule,
  ],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}
