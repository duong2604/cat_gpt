import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSeedService } from './admin-seed.service.js';
import { User, UserSchema } from './schemas/user.schema.js';
import { UserPresenter } from './user.presenter.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, UserPresenter, AdminSeedService],
  exports: [UsersService, UserPresenter],
})
export class UsersModule {}
