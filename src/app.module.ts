import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [UsersModule, AdminsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
