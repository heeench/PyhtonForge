import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Хранилище временно недоступно');return env.DB;}
