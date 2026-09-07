import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (
    process.env.CORS_ORIGINS ??
    'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:8081,http://127.0.0.1:8081'
  ).split(',');

  app.use(helmet());
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`EchoFlow API listening on http://localhost:${port}/api/v1`);
}

void bootstrap();
