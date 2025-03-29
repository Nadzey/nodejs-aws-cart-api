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

    // VPC setup
    const vpc = new ec2.Vpc(this, 'NestJsVPC', {
      maxAzs: 2, // Maximum availability zones
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
      natGateways: 1, // One NAT Gateway for private subnets
    });

    // Security group for Lambda function
    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true,
    });

    // Lambda function definition using Node.js
    const handler = new NodejsFunction(this, 'NestJsLambda', {
      functionName: 'cartLambda',
      runtime: lambda.Runtime.NODEJS_18_X, // Node.js runtime for Lambda
      handler: 'handler', // Name of the exported handler function in your entry file
      entry: path.join(__dirname, '../../src/lambda.ts'), // Path to Lambda entry file
      depsLockFilePath: path.join(__dirname, '../../package-lock.json'), // Package lock file for dependencies
      timeout: cdk.Duration.seconds(30), // Timeout for the Lambda function
      environment: {
        NODE_ENV: 'production', // Set environment variable for the Lambda function
      },
      // reservedConcurrentExecutions: 1, // Reserved concurrency (adjust as needed)
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node18', // Bundling target for Node.js 18
        nodeModules: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/platform-express',
          'reflect-metadata',
          '@vendia/serverless-express',
        ], // External node modules for bundling
        externalModules: ['@aws-sdk/*', 'aws-sdk'], // Exclude these modules from bundling
      },
      vpc, // Attach Lambda to VPC
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Private subnet for Lambda
      },
      securityGroups: [lambdaSG], // Attach security group
      memorySize: 512, // Memory size for the Lambda function
    });

    // API Gateway setup to expose Lambda function as HTTP endpoint
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'CartService', // Set the API name to CartService
      description: 'This is the CartService API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // CORS settings
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        throttlingRateLimit: 1, // Throttling rate limit for API Gateway
        throttlingBurstLimit: 1, // Throttling burst limit for API Gateway
      },
    });

    // Create Lambda integration for API Gateway
    const integration = new apigateway.LambdaIntegration(handler, {
      proxy: true, // Use the proxy integration to forward requests
    });

    // Add proxy route to API Gateway
    api.root.addProxy({
      defaultIntegration: integration, // Use the Lambda integration
      anyMethod: true, // Allow any HTTP method
    });

    // Output API URL for easy access
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL', // Description of the output
    });
  }
}
