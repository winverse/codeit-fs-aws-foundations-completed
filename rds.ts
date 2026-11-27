import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ec2SecurityGroup } from "./ec2";
import { privateSubnetA, privateSubnetC, vpc } from "./network";

const config = new pulumi.Config();

const databaseSecurityGroup = new aws.ec2.SecurityGroup("codeit-db-sg", {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 3306,
      toPort: 3306,
      securityGroups: [ec2SecurityGroup.id],
    },
  ],
});

const subnetGroup = new aws.rds.SubnetGroup("codeit-db-subnets", {
  subnetIds: [privateSubnetA.id, privateSubnetC.id],
});

const database = new aws.rds.Instance("codeit-mysql", {
  engine: "mysql",
  instanceClass: "db.t3.micro",
  allocatedStorage: 20,
  storageType: "gp3",
  storageEncrypted: true,
  dbName: "appdb",
  username: "appadmin",
  password: config.requireSecret("dbPassword"),
  dbSubnetGroupName: subnetGroup.name,
  vpcSecurityGroupIds: [databaseSecurityGroup.id],
  publiclyAccessible: false,
  skipFinalSnapshot: true,
});

export const databaseEndpoint = database.address;
