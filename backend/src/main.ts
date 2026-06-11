import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const extraOrigins = [
    process.env.CORS_FRONTEND_URL,
    process.env.CORS_ADMIN_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:5173', ...extraOrigins],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
