import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import 'reflect-metadata';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Load DB environment variables
    const dbEnv = {
      DB_HOST: process.env.DB_HOST || '',
      DB_PORT: process.env.DB_PORT || '5432',
      DB_USERNAME: process.env.DB_USERNAME || '',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      DB_NAME: process.env.DB_NAME || '',
    };

    // Optional: validate all required DB vars are present
    if (!dbEnv.DB_HOST || !dbEnv.DB_USERNAME || !dbEnv.DB_PASSWORD || !dbEnv.DB_NAME) {
      throw new Error('Missing one or more DB environment variables!');
    }

    // VPC setup
    const vpc = new ec2.Vpc(this, 'NestJsVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
      natGateways: 1,
    });

    // Security group for Lambda
    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true,
    });

    // Lambda function
    const handler = new NodejsFunction(this, 'NestJsLambda', {
      functionName: 'cartLambda',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/lambda.ts'),
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production',
        ...dbEnv,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        nodeModules: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/platform-express',
          'reflect-metadata',
          '@vendia/serverless-express',
        ],
        externalModules: ['@aws-sdk/*', 'aws-sdk'],
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSG],
    });

    // API Gateway setup
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'CartService',
      description: 'This is the CartService API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        throttlingRateLimit: 1,
        throttlingBurstLimit: 1,
      },
    });

    // Lambda integration
    const integration = new apigateway.LambdaIntegration(handler, {
      proxy: true,
    });

    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
