import * as aws from "@pulumi/aws";
import { ec2Role } from "./ec2";

const bucket = new aws.s3.Bucket("codeit-bucket", { forceDestroy: true });

new aws.s3.BucketVersioning("codeit-bucket-versioning", {
  bucket: bucket.id,
  versioningConfiguration: { status: "Enabled" },
});

new aws.s3.BucketPublicAccessBlock("codeit-bucket-public-access-block", {
  bucket: bucket.id,
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,
});

new aws.iam.RolePolicy("codeit-ec2-s3-policy", {
  role: ec2Role.name,
  policy: bucket.arn.apply((bucketArn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        { Effect: "Allow", Action: ["s3:ListBucket"], Resource: [bucketArn] },
        {
          Effect: "Allow",
          Action: ["s3:GetObject", "s3:PutObject"],
          Resource: [`${bucketArn}/*`],
        },
      ],
    }),
  ),
});

export const bucketName = bucket.id;
