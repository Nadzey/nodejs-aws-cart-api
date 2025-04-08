import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { configure as serverlessExpress } from '@vendia/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import 'reflect-metadata';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    nestApp.enableCors();
    await nestApp.init();

    // cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const server = await bootstrap();
  return server(event, context, callback);
};

if (require.main === module) {
  console.log('[DEBUG] Running lambda handler locally');

  const mockEvent = {
    version: '2.0',
    routeKey: 'GET /ping',
    rawPath: '/ping',
    rawQueryString: '',
    headers: {
      host: 'localhost',
      'Content-Type': 'application/json',
    },
    requestContext: {
      http: {
        method: 'GET',
        path: '/ping',
      },
    },
    isBase64Encoded: false,
  };

  handler(mockEvent, {} as any, (error, response) => {
    if (error) {
      console.error('[LAMBDA ERROR]', error);
    } else {
      console.log('[LAMBDA RESPONSE]', response);
    }
  });
}
