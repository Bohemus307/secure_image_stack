#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SecureImageStorageStack } from "../lib";
import { config } from "../lib/configuration";

/**
 * Create a new CDK app instance.
 */
const app = new cdk.App();

/**
 * Create and configure the ImageStack.
 * This stack sets up the buckets and distro etc. for image upload and download in conumser platform applciation.
 *
 * @param {cdk.App} app - The CDK app instance
 * @param {string} id - The ID for the stack
 * @param {cdk.StackProps} props - The properties for the stack
 */
export const SecureImageStack = new SecureImageStorageStack(
  app,
  `${config.APP_NAME}`,
  {
    env: { account: config.ACCOUNT_ID, region: config.RESOURCE_DEPLOYMENT_REGION },
  }
);

/**
 * Synthesize the CloudFormation template.
 */
app.synth();

/**
 * Export the app for potential external use.
 */
export { app };
