import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');
  await app.listen(port, host);
  const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
  Logger.log(`API: ${url} | Interactive documentation: ${url}/docs`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  Logger.error(error instanceof Error ? error.message : 'Startup failed.', 'Bootstrap');
  process.exitCode = 1;
});
