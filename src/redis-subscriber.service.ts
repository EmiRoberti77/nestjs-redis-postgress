import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {RedisConnect, RedisTopic, redisSchema} from './entity/redisParam'
import { createClient} from 'redis'

@Injectable()
export class RedisSubscriberService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private redisClient;
  private redisConnect:RedisConnect;
  private redisTopic:RedisTopic;

  async onModuleInit() {    
    console.log('onModuleInit')
    const url = process.env.REDIS_URL;
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
        (message, channelName) => {
            this.logger.log('________________')
            this.logger.log(message)
            this.logger.log(channelName)
        }
    )
  }

  async onModuleDestroy() {
      
  }
}