import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line import/no-unresolved
// @ts-ignore - supabase types resolved at build time
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisSubscriberService } from './redis-subscriber.service';

dotenv.config();

const supabaseUrl = process.env.DB_URL;
const supabaseApiKey = process.env.DB_API_KEY;

if (!supabaseUrl) {
  throw new Error('Missing DB_URL in .env');
}

if (!supabaseApiKey) {
  throw new Error('Missing DB_API_KEY in .env');
}

const supabaseClient = createClient(supabaseUrl, supabaseApiKey);

const supabaseProvider = {
  provide: 'SUPABASE_CLIENT',
  useValue: supabaseClient,
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RedisSubscriberService, supabaseProvider],
})
export class AppModule {}
