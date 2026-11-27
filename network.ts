import * as aws from "@pulumi/aws";

export const vpc = new aws.ec2.Vpc("codeit-vpc", {
  cidrBlock: "10.20.0.0/16",
  enableDnsSupport: true,
  enableDnsHostnames: true,
  tags: { Name: "codeit-vpc" },
});

export const publicSubnet = new aws.ec2.Subnet("codeit-public-a", {
  vpcId: vpc.id,
  cidrBlock: "10.20.0.0/24",
  availabilityZone: "ap-northeast-2a",
});

export const privateSubnetA = new aws.ec2.Subnet("codeit-private-a", {
  vpcId: vpc.id,
  cidrBlock: "10.20.10.0/24",
  availabilityZone: "ap-northeast-2a",
});

export const privateSubnetC = new aws.ec2.Subnet("codeit-private-c", {
  vpcId: vpc.id,
  cidrBlock: "10.20.20.0/24",
  availabilityZone: "ap-northeast-2c",
});

const internetGateway = new aws.ec2.InternetGateway("codeit-igw", {
  vpcId: vpc.id,
});

const publicRouteTable = new aws.ec2.RouteTable("codeit-public-rt", {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: internetGateway.id }],
});

new aws.ec2.RouteTableAssociation("codeit-public-a-assoc", {
  subnetId: publicSubnet.id,
  routeTableId: publicRouteTable.id,
});

export const vpcId = vpc.id;
