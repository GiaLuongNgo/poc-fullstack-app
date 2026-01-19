import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

// Get configuration
const config = new pulumi.Config();
const dbUsername = config.get('dbUsername') || 'pocuser';
const dbPassword = config.requireSecret('dbPassword');

// Create VPC with public and private subnets across 2 AZs
const vpc = new awsx.ec2.Vpc('poc-vpc', {
  cidrBlock: '10.0.0.0/16',
  numberOfAvailabilityZones: 2,
  subnetSpecs: [
    { type: awsx.ec2.SubnetType.Public, cidrMask: 24 },
    { type: awsx.ec2.SubnetType.Private, cidrMask: 24 },
  ],
  natGateways: {
    strategy: awsx.ec2.NatGatewayStrategy.Single,
  },
  tags: {
    Name: 'poc-vpc',
    Project: 'poc-fullstack-app',
  },
});

// Security Group for Application Load Balancer
const albSecurityGroup = new aws.ec2.SecurityGroup('alb-sg', {
  vpcId: vpc.vpcId,
  description: 'Security group for Application Load Balancer',
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'Allow HTTP from internet',
    },
    {
      protocol: 'tcp',
      fromPort: 443,
      toPort: 443,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'Allow HTTPS from internet',
    },
  ],
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'Allow all outbound traffic',
    },
  ],
  tags: {
    Name: 'poc-alb-sg',
    Project: 'poc-fullstack-app',
  },
});

// Security Group for ECS Tasks
const ecsSecurityGroup = new aws.ec2.SecurityGroup('ecs-sg', {
  vpcId: vpc.vpcId,
  description: 'Security group for ECS tasks',
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 3000,
      toPort: 3001,
      securityGroups: [albSecurityGroup.id],
      description: 'Allow traffic from ALB',
    },
  ],
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'Allow all outbound traffic',
    },
  ],
  tags: {
    Name: 'poc-ecs-sg',
    Project: 'poc-fullstack-app',
  },
});

// Security Group for RDS
const rdsSecurityGroup = new aws.ec2.SecurityGroup('rds-sg', {
  vpcId: vpc.vpcId,
  description: 'Security group for RDS PostgreSQL',
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 5432,
      toPort: 5432,
      securityGroups: [ecsSecurityGroup.id],
      description: 'Allow PostgreSQL from ECS tasks',
    },
  ],
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
      description: 'Allow all outbound traffic',
    },
  ],
  tags: {
    Name: 'poc-rds-sg',
    Project: 'poc-fullstack-app',
  },
});

// RDS Subnet Group
const rdsSubnetGroup = new aws.rds.SubnetGroup('poc-rds-subnet-group', {
  subnetIds: vpc.privateSubnetIds,
  tags: {
    Name: 'poc-rds-subnet-group',
    Project: 'poc-fullstack-app',
  },
});

// RDS PostgreSQL Instance
const rdsInstance = new aws.rds.Instance('poc-postgres', {
  engine: 'postgres',
  engineVersion: '16',
  instanceClass: 'db.t3.micro',
  allocatedStorage: 20,
  storageType: 'gp2',
  dbName: 'pocdb',
  username: dbUsername,
  password: dbPassword,
  dbSubnetGroupName: rdsSubnetGroup.name,
  vpcSecurityGroupIds: [rdsSecurityGroup.id],
  skipFinalSnapshot: true,
  publiclyAccessible: false,
  tags: {
    Name: 'poc-postgres',
    Project: 'poc-fullstack-app',
  },
});

// ECR Repositories
const backendRepo = new aws.ecr.Repository('backend-repo', {
  name: 'poc-backend',
  imageScanningConfiguration: {
    scanOnPush: true,
  },
  imageTagMutability: 'MUTABLE',
  tags: {
    Name: 'poc-backend-repo',
    Project: 'poc-fullstack-app',
  },
});

const frontendRepo = new aws.ecr.Repository('frontend-repo', {
  name: 'poc-frontend',
  imageScanningConfiguration: {
    scanOnPush: true,
  },
  imageTagMutability: 'MUTABLE',
  tags: {
    Name: 'poc-frontend-repo',
    Project: 'poc-fullstack-app',
  },
});

// ECS Cluster
const cluster = new aws.ecs.Cluster('poc-cluster', {
  name: 'poc-cluster',
  settings: [
    {
      name: 'containerInsights',
      value: 'enabled',
    },
  ],
  tags: {
    Name: 'poc-cluster',
    Project: 'poc-fullstack-app',
  },
});

// CloudWatch Log Groups
const backendLogGroup = new aws.cloudwatch.LogGroup('backend-logs', {
  name: '/ecs/poc-backend',
  retentionInDays: 7,
  tags: {
    Name: 'poc-backend-logs',
    Project: 'poc-fullstack-app',
  },
});

const frontendLogGroup = new aws.cloudwatch.LogGroup('frontend-logs', {
  name: '/ecs/poc-frontend',
  retentionInDays: 7,
  tags: {
    Name: 'poc-frontend-logs',
    Project: 'poc-fullstack-app',
  },
});

// ECS Task Execution Role
const taskExecutionRole = new aws.iam.Role('task-execution-role', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: 'ecs-tasks.amazonaws.com',
        },
      },
    ],
  }),
  tags: {
    Name: 'poc-task-execution-role',
    Project: 'poc-fullstack-app',
  },
});

new aws.iam.RolePolicyAttachment('task-execution-role-policy', {
  role: taskExecutionRole.name,
  policyArn: 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
});

// Application Load Balancer
const alb = new aws.lb.LoadBalancer('poc-alb', {
  internal: false,
  loadBalancerType: 'application',
  securityGroups: [albSecurityGroup.id],
  subnets: vpc.publicSubnetIds,
  tags: {
    Name: 'poc-alb',
    Project: 'poc-fullstack-app',
  },
});

// Target Groups
const backendTargetGroup = new aws.lb.TargetGroup('backend-tg', {
  port: 3001,
  protocol: 'HTTP',
  vpcId: vpc.vpcId,
  targetType: 'ip',
  healthCheck: {
    enabled: true,
    path: '/api/health',
    interval: 30,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
  },
  tags: {
    Name: 'poc-backend-tg',
    Project: 'poc-fullstack-app',
  },
});

const frontendTargetGroup = new aws.lb.TargetGroup('frontend-tg', {
  port: 3000,
  protocol: 'HTTP',
  vpcId: vpc.vpcId,
  targetType: 'ip',
  healthCheck: {
    enabled: true,
    path: '/',
    interval: 30,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
  },
  tags: {
    Name: 'poc-frontend-tg',
    Project: 'poc-fullstack-app',
  },
});

// ALB Listener
const listener = new aws.lb.Listener('poc-listener', {
  loadBalancerArn: alb.arn,
  port: 80,
  protocol: 'HTTP',
  defaultActions: [
    {
      type: 'forward',
      targetGroupArn: frontendTargetGroup.arn,
    },
  ],
});

// Listener Rule for Backend API
new aws.lb.ListenerRule('backend-rule', {
  listenerArn: listener.arn,
  priority: 100,
  actions: [
    {
      type: 'forward',
      targetGroupArn: backendTargetGroup.arn,
    },
  ],
  conditions: [
    {
      pathPattern: {
        values: ['/api/*'],
      },
    },
  ],
});

// Database URL for backend
const databaseUrl = pulumi.interpolate`postgresql://${dbUsername}:${dbPassword}@${rdsInstance.endpoint}/${rdsInstance.dbName}`;

// Backend Task Definition
const backendTaskDefinition = new aws.ecs.TaskDefinition('backend-task', {
  family: 'poc-backend',
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  cpu: '256',
  memory: '512',
  executionRoleArn: taskExecutionRole.arn,
  containerDefinitions: pulumi.interpolate`[
    {
      "name": "backend",
      "image": "${backendRepo.repositoryUrl}:latest",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "${databaseUrl}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${backendLogGroup.name}",
          "awslogs-region": "${aws.config.region}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]`,
  tags: {
    Name: 'poc-backend-task',
    Project: 'poc-fullstack-app',
  },
});

// Frontend Task Definition
const frontendTaskDefinition = new aws.ecs.TaskDefinition('frontend-task', {
  family: 'poc-frontend',
  networkMode: 'awsvpc',
  requiresCompatibilities: ['FARGATE'],
  cpu: '256',
  memory: '512',
  executionRoleArn: taskExecutionRole.arn,
  containerDefinitions: pulumi.interpolate`[
    {
      "name": "frontend",
      "image": "${frontendRepo.repositoryUrl}:latest",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "http://${alb.dnsName}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${frontendLogGroup.name}",
          "awslogs-region": "${aws.config.region}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]`,
  tags: {
    Name: 'poc-frontend-task',
    Project: 'poc-fullstack-app',
  },
});

// Backend ECS Service
const backendService = new aws.ecs.Service('backend-service', {
  cluster: cluster.arn,
  taskDefinition: backendTaskDefinition.arn,
  desiredCount: 1,
  launchType: 'FARGATE',
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [ecsSecurityGroup.id],
    assignPublicIp: false,
  },
  loadBalancers: [
    {
      targetGroupArn: backendTargetGroup.arn,
      containerName: 'backend',
      containerPort: 3001,
    },
  ],
  tags: {
    Name: 'poc-backend-service',
    Project: 'poc-fullstack-app',
  },
}, { dependsOn: [listener] });

// Frontend ECS Service
const frontendService = new aws.ecs.Service('frontend-service', {
  cluster: cluster.arn,
  taskDefinition: frontendTaskDefinition.arn,
  desiredCount: 1,
  launchType: 'FARGATE',
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [ecsSecurityGroup.id],
    assignPublicIp: false,
  },
  loadBalancers: [
    {
      targetGroupArn: frontendTargetGroup.arn,
      containerName: 'frontend',
      containerPort: 3000,
    },
  ],
  tags: {
    Name: 'poc-frontend-service',
    Project: 'poc-fullstack-app',
  },
}, { dependsOn: [listener] });

// Exports
export const vpcId = vpc.vpcId;
export const albUrl = pulumi.interpolate`http://${alb.dnsName}`;
export const backendRepositoryUrl = backendRepo.repositoryUrl;
export const frontendRepositoryUrl = frontendRepo.repositoryUrl;
export const rdsEndpoint = rdsInstance.endpoint;
export const clusterName = cluster.name;
