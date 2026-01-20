import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line import/no-unresolved
// @ts-ignore - supabase types resolved at build time
import { SupabaseClient } from '@supabase/supabase-js';
import { RedisConnect, RedisTopic, redisSchema } from './entity/redisParam.entity';

type TelemetryInsert = {
  ppp_id: string;
  ts: string;
  event_type: string;
  data: Record<string, any>;
};

@Injectable()
export class RedisSubscriberService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private redisClient;
  private redisConnect:RedisConnect;
  private redisTopic:RedisTopic;

  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async onModuleInit() {    
    console.log('onModuleInit')
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);
    const user = process.env.REDIS_USER;
    const pass = process.env.REDIS_PASS;
    const topic = process.env.REDIS_TOPIC;

    if(!host) throw new Error('Missing host')
    if(!port) throw new Error('Missing port')
    if(!user) throw new Error('Missing user')
    if(!pass) throw new Error('Missing pass')
    if(!topic) throw new Error('Missing topic')

    // fill redis connect object
    this.redisConnect = {
      host,
      port,
      user,
      pass
    }

    // fill topic object
    this.redisTopic = {
        topic
    }

    const success = JSON.stringify(redisSchema.safeParse(this.redisConnect), null, 2)
    console.log(success)
    const connected = await this.connect(this.redisConnect);
    console.log(`connected=${connected}`)
  }

  async connect(p: RedisConnect): Promise<boolean> {
    console.log('subscribe')
    console.log(p)
    this.redisClient = createClient({
      username: p.user,
      password: p.pass,
      socket:{
        host: p.host,
        port: p.port
      }
    })

    // handle errors with call back
    this.redisClient.on('error', (err)=>{
        this.logger.error(`redis error -> ${err}`)
    })

    console.log('created client ok')
    await this.redisClient.connect()
    await this.subsrcibe()
    return true;
  }

  async subsrcibe(){
    await this.redisClient.subscribe(this.redisTopic.topic, 
        async (message, channelName) => {
            this.logger.log('________________')
            this.logger.log(message)
            this.logger.log(channelName)
            const pppTelemetry: TelemetryInsert = {
              ppp_id:'vsg-ppp-001',
              ts: new Date(Date.now()).toISOString(),
              event_type:'telemetry/health',
              data:JSON.parse(message)
            }
            await this.persistTelemetry(pppTelemetry)
        }
    )
  }

  async persistTelemetry(pppTelemetry: TelemetryInsert) {
    try {
      const { error } = await this.supabase
        .from('ppp_telemetry')
        .insert(pppTelemetry);

      if (error) {
        throw error;
      }
    } catch(err) {
      this.logger.error(err)
    }
  }

  async onModuleDestroy() {
      this.logger.log('onModuleDestroy')
      this.logger.log('good bye')
  }
}