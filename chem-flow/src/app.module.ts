import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsModule } from './slots/slots.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    // 1. globally config for .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. TypeORM data take from .env
    TypeOrmModule.forRootAsync({ 
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ((configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      })),
    }),

    // 3. Feature Modules
    AuthModule,
    UsersModule,
    EquipmentsModule,
    ChemicalsModule,
    StorageModule,
    GroupsModule,
    BookingsModule,
    DocumentsModule,
    MailModule,
    AuditModule,
    SlotsModule,
    AdminModule,
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
