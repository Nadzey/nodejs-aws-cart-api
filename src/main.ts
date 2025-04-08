import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler, Context } from 'aws-lambda';
import { CartService } from './cart/services/cart.service';
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';

let appContext: INestApplication;

async function bootstrap() {
  if (!appContext) {
    appContext = await NestFactory.create(AppModule);
    await appContext.init();
  }
  return appContext;
}

export const handler: Handler = async (event: any, context: Context) => {
  const app = await bootstrap();
  const cartService = app.get(CartService);
  const userId = event.queryStringParameters?.userId || 'guest';
  const cart = cartService.findOrCreateByUserId(userId);

  return {
    statusCode: 200,
    body: JSON.stringify(cart),
  };
};
