import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisSubscriberService } from './redis-subscriber.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RedisSubscriberService],
})
export class AppModule {}
