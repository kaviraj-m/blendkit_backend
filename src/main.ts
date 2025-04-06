import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Create logs directory if it doesn't exist
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Create a write stream for logging
  const logFilePath = path.join(logDir, `app-${new Date().toISOString().replace(/:/g, '-')}.log`);
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  
  // Custom logger for file logging
  const logger = new Logger('Bootstrap');
  logger.log(`Logging to file: ${logFilePath}`);
  
  // You can use this to pipe console output to file if needed
  // process.stdout.pipe(logStream);
  // process.stderr.pipe(logStream);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Enable CORS with more detailed configuration
  app.enableCors({
    origin: true, // Allow all origins or specify with ['http://localhost:3000']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('BlendKit API')
    .setDescription('API documentation for BlendKit application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Get all routes for debugging
  try {
    logger.log('Available API Routes:');
    
    // Use a safer approach to get routes - with error handling
    const routesInfo = app.getHttpAdapter()['getInstance']()._router;
    
    if (routesInfo && routesInfo.stack) {
      routesInfo.stack
        .filter(layer => layer.route)
        .forEach(layer => {
          const path = layer.route?.path;
          const methods = layer.route?.methods ? Object.keys(layer.route.methods).map(m => m.toUpperCase()) : ['UNKNOWN'];
          logger.log(`${methods.join(', ')} ${path}`);
        });
    } else {
      logger.warn('Could not access routes information. Router structure might be different than expected.');
    }
  } catch (error) {
    logger.warn(`Could not log routes: ${error.message}`);
  }

  // Start the application
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger API docs available at: http://localhost:${port}/api/docs`);
  
  // Log database connection info for debugging
  logger.log(`Database connection details: HOST=${process.env.DB_HOST}, PORT=${process.env.DB_PORT}, DB=${process.env.DB_NAME}`);
}
bootstrap();
