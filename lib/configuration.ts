// config.ts

export interface Config {
  APP_NAME: string;
  ACCOUNT_ID: string;
  RESOURCE_DEPLOYMENT_REGION: string;
  bucketName: string;
  allowedDomains: string[];
}

export const config: Config = {
  APP_NAME: 'consumer-platform-secure-image-stack',
  RESOURCE_DEPLOYMENT_REGION: 'us-east-1',
  ACCOUNT_ID: "365497649378",
  bucketName: "consumer-platform-storage",
  allowedDomains: [
    "https://consumer-develop.givinga.dev",
    "https://consumer-staging.givinga.dev",
    "https://consumer.givinga.dev",
  ],
};
