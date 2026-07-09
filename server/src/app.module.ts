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

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TicketsModule, AssetsModule, FieldsModule, LoansModule, NotificationsModule, ReportsModule, VisitsModule, SupabaseModule, DashboardModule],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}
