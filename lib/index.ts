// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface SecureImageStorageProps {
  // Define construct properties here
}

export class SecureImageStorage extends Construct {

  constructor(scope: Construct, id: string, props: SecureImageStorageProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'SecureImageStorageQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
