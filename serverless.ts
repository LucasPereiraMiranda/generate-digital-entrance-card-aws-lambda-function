import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'generate-digital-entrance-card-aws-lambda-function',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: ['*'],
      },
    ],
  },
  // import the function via paths
  functions: {
    generateCertificate: {
      handler: 'src/functions/generateDigitalEntranceCard.handler',
      events: [
        {
          http: {
            path: 'generateDigitalEntranceCard',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': 'undefined' },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    // para usar os recursos da aws
    Resources: {
      dbCertificateUsers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'digital_entrance_card',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: 'userId',
              AttributeType: 'S',
            },
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'id',
              KeyType: 'RANGE',
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
