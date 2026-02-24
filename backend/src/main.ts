import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS — allow frontend
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Validation
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Supply Chain Control Tower API')
        .setDescription('Reporting-only API for SC metrics, dimensions, and data quality')
        .setVersion('1.0')
        .addTag('metrics', 'KPI Catalog & metric queries')
        .addTag('dimensions', 'Dimension members for filters')
        .addTag('health', 'Data freshness & health checks')
        .addTag('audit', 'Audit trail')
        .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, doc);

    const port = process.env.BACKEND_PORT || 3001;
    await app.listen(port);
    console.log(`🚀 SCCT Backend running on http://localhost:${port}`);
    console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
