import {z} from 'zod'

export const redisSchema = z.object({
    host:z.string(),
    port:z.number(),
    user:z.string().default('default'),
    pass:z.string()
})

const redisTopic = z.object({
    topic:z.string()
})

export type RedisConnect = z.infer<typeof redisSchema>;
export type RedisTopic = z.infer<typeof redisTopic>