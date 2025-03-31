import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { PetsModule } from './pets/pets.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [AdminsModule, AuthModule, PetsModule, CacheModule.register()],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
