import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { config } from "./configuration";

export class SecureImageStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, "ImageBucket", {
      bucketName: config.bucketName,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: [
            "http://localhost:3000",
            "https://consumer-develop.givinga.dev",
            "https://consumer-staging.givinga.dev",
            "https://consumer.givinga.dev",
          ],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront origin access identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OAI"
    );

    // Add bucket policy
    const bucketPolicy = new s3.BucketPolicy(this, "BucketPolicy", {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        sid: "DenyInsecureTransport",
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        conditions: {
          Bool: {
            "aws:SecureTransport": "false",
          },
        },
      }),
      new iam.PolicyStatement({
        sid: "AllowCloudFrontOAIRead",
        effect: iam.Effect.ALLOW,
        principals: [originAccessIdentity.grantPrincipal],
        actions: ["s3:GetBucket*", "s3:GetObject*", "s3:List*"],
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
      }),
      new iam.PolicyStatement({
        sid: "AllowIAMUserPutObject",
        effect: iam.Effect.ALLOW,
        principals: [
          new iam.ArnPrincipal("arn:aws:iam::365497649378:user/joxner"),
        ],
        actions: ["s3:PutObject", "s3:PutObjectAcl"],
        resources: [`${bucket.bucketArn}/*`],
      }),
      new iam.PolicyStatement({
        sid: "DenyGetObjectExceptCloudFront",
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:GetObject"],
        resources: [`${bucket.bucketArn}/*`],
        conditions: {
          StringNotLike: {
            "aws:UserAgent": "Amazon CloudFront",
          },
        },
      })
    );

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(
      this,
      "ImageDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(bucket, { originAccessIdentity }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      }
    );

    // Output the CloudFront distribution URL
    new cdk.CfnOutput(this, "DistributionUrl", {
      value: distribution.distributionDomainName,
      description: "CloudFront Distribution URL",
    });
  }
}
