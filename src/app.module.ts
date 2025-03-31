import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AdminsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
