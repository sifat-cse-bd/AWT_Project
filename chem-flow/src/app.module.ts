import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { EquipmentsModule } from './equipments/equipments.module.js';
import { ChemicalsModule } from './chemicals/chemicals.module.js';
import { StorageModule } from './storage/storage.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { MailModule } from './mail/mail.module.js';
import { AuditModule } from './audit/audit.module.js';

@Module({
  imports: [AuthModule, UsersModule, EquipmentsModule, ChemicalsModule, StorageModule, GroupsModule, BookingsModule, DocumentsModule, MailModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
