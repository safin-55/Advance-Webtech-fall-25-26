import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function databaseOptions(config: ConfigService): TypeOrmModuleOptions {
  const shared = {
    autoLoadEntities: true,
    synchronize: config.getOrThrow<boolean>('DB_SYNCHRONIZE'),
    logging: config.getOrThrow<boolean>('DB_LOGGING'),
    retryAttempts: 1,
  };
  const type = config.getOrThrow<string>('DB_TYPE');
  if (type === 'sqlite') {
    const location = resolve(config.getOrThrow<string>('DB_DATABASE'));
    mkdirSync(dirname(location), { recursive: true });
    // sql.js runs SQLite through WebAssembly; every change is saved to this file.
    // The next process opens the same database. This is not an array repository.
    return { ...shared, type: 'sqljs', location, autoSave: true };
  }
  return {
    ...shared,
    type: type as 'postgres' | 'mysql',
    host: config.getOrThrow<string>('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    username: config.getOrThrow<string>('DB_USERNAME'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>('DB_NAME'),
  };
}
