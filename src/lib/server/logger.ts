import pino from 'pino';
import { dev } from '$app/environment';

const logger = pino({
    level: dev ? 'debug' : 'info',
    ...(dev && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' }
        }
    })
});

export default logger;
