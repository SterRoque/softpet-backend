import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [AdminsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
