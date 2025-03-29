import { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configure as serverlessExpress } from '@vendia/serverless-express';
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

    cachedServer = serverlessExpress({ app: expressApp });
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
