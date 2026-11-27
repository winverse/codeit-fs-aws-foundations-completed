import * as aws from "@pulumi/aws";
import { publicSubnet, vpc } from "./network";

export const ec2SecurityGroup = new aws.ec2.SecurityGroup("codeit-ec2-sg", {
  vpcId: vpc.id,
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

export const ec2Role = new aws.iam.Role("codeit-ec2-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { Service: "ec2.amazonaws.com" },
        Action: "sts:AssumeRole",
      },
    ],
  }),
});

new aws.iam.RolePolicyAttachment("codeit-ssm-core", {
  role: ec2Role.name,
  policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
});

const instanceProfile = new aws.iam.InstanceProfile("codeit-ec2-profile", {
  role: ec2Role.name,
});

const amazonLinux = aws.ec2.getAmiOutput({
  owners: ["amazon"],
  mostRecent: true,
  filters: [{ name: "name", values: ["al2023-ami-2023.*-x86_64"] }],
});

const instance = new aws.ec2.Instance("codeit-ec2", {
  ami: amazonLinux.id,
  instanceType: "t3.micro",
  subnetId: publicSubnet.id,
  vpcSecurityGroupIds: [ec2SecurityGroup.id],
  iamInstanceProfile: instanceProfile.name,
  associatePublicIpAddress: true,
  rootBlockDevice: { volumeType: "gp3", volumeSize: 8 },
});

export const instanceId = instance.id;
