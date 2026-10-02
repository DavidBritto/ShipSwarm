"""AWS CloudFormation and CDK IaC generator for ShipSwarm AI."""

from __future__ import annotations

import json
from typing import Dict, Any
from shipswarm.builder.repo_inspector import ProjectSpecification
from shipswarm.models.schemas import ArchitectureTopology


def generate_cloudformation_template(
    spec: ProjectSpecification,
    topology: ArchitectureTopology,
) -> str:
    """Generate a production-ready, validated AWS CloudFormation YAML/JSON template."""
    clean_name = spec.name.replace("-", "")

    # Python Lambda handler code embedded in template
    lambda_code = f'''
import json
import os
import time

def handler(event, context):
    path = event.get("rawPath", event.get("path", "/"))
    method = event.get("requestContext", {{}}).get("http", {{}}).get("method", "GET")
    
    headers = {{
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    }}
    
    if method == "OPTIONS":
        return {{"statusCode": 204, "headers": headers}}
        
    if path == "/health":
        return {{
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({{
                "status": "healthy",
                "service": "{spec.name}",
                "version": "1.0.0",
                "archetype": "{spec.archetype}",
                "framework": "{spec.detected_framework}",
                "timestamp": time.time()
            }})
        }}
        
    return {{
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({{
            "message": "Welcome to {spec.name} deployed by ShipSwarm AI",
            "path": path,
            "method": method,
            "description": "{spec.description}",
            "endpoints": {json.dumps(spec.suggested_endpoints)},
            "table_name": os.environ.get("TABLE_NAME", "unknown")
        }})
    }}
'''.strip()

    template: Dict[str, Any] = {
        "AWSTemplateFormatVersion": "2010-09-09",
        "Description": f"ShipSwarm AI Autonomous Cloud Stack for {spec.name}",
        "Parameters": {
            "Environment": {
                "Type": "String",
                "Default": "prod",
                "AllowedValues": ["dev", "prod"],
                "Description": "Deployment environment"
            }
        },
        "Resources": {
            "ExecutionRole": {
                "Type": "AWS::IAM::Role",
                "Properties": {
                    "RoleName": {"Fn::Sub": f"{spec.name}-${{Environment}}-exec-role"},
                    "AssumeRolePolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [{
                            "Effect": "Allow",
                            "Principal": {"Service": "lambda.amazonaws.com"},
                            "Action": "sts:AssumeRole"
                        }]
                    },
                    "ManagedPolicyArns": [
                        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
                    ],
                    "Policies": [{
                        "PolicyName": "DynamoDBLeastPrivilege",
                        "PolicyDocument": {
                            "Version": "2012-10-17",
                            "Statement": [{
                                "Effect": "Allow",
                                "Action": [
                                    "dynamodb:GetItem",
                                    "dynamodb:PutItem",
                                    "dynamodb:UpdateItem",
                                    "dynamodb:DeleteItem",
                                    "dynamodb:Query",
                                    "dynamodb:Scan"
                                ],
                                "Resource": {"Fn::GetAtt": ["DataTable", "Arn"]}
                            }]
                        }
                    }]
                }
            },
            "DataTable": {
                "Type": "AWS::DynamoDB::Table",
                "Properties": {
                    "TableName": {"Fn::Sub": f"{spec.name}-${{Environment}}-data"},
                    "BillingMode": "PAY_PER_REQUEST",
                    "AttributeDefinitions": [{
                        "AttributeName": "pk",
                        "AttributeType": "S"
                    }],
                    "KeySchema": [{
                        "AttributeName": "pk",
                        "KeyType": "HASH"
                    }]
                }
            },
            "LogGroup": {
                "Type": "AWS::Logs::LogGroup",
                "Properties": {
                    "LogGroupName": {"Fn::Sub": f"/aws/lambda/{spec.name}-${{Environment}}"},
                    "RetentionInDays": 7
                }
            },
            "LambdaFunction": {
                "Type": "AWS::Lambda::Function",
                "DependsOn": ["ExecutionRole", "LogGroup"],
                "Properties": {
                    "FunctionName": {"Fn::Sub": f"{spec.name}-${{Environment}}"},
                    "Runtime": "python3.12",
                    "Handler": "index.handler",
                    "Role": {"Fn::GetAtt": ["ExecutionRole", "Arn"]},
                    "MemorySize": 256,
                    "Timeout": 10,
                    "Environment": {
                        "Variables": {
                            "TABLE_NAME": {"Ref": "DataTable"},
                            "ENV": {"Ref": "Environment"}
                        }
                    },
                    "Code": {
                        "ZipFile": lambda_code
                    }
                }
            },
            "HttpApi": {
                "Type": "AWS::ApiGatewayV2::Api",
                "Properties": {
                    "Name": {"Fn::Sub": f"{spec.name}-${{Environment}}-api"},
                    "ProtocolType": "HTTP",
                    "CorsConfiguration": {
                        "AllowOrigins": ["*"],
                        "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                        "AllowHeaders": ["Content-Type", "Authorization", "X-Api-Key"],
                        "MaxAge": 3600
                    }
                }
            },
            "HttpApiStage": {
                "Type": "AWS::ApiGatewayV2::Stage",
                "Properties": {
                    "ApiId": {"Ref": "HttpApi"},
                    "StageName": "$default",
                    "AutoDeploy": True
                }
            },
            "HttpApiIntegration": {
                "Type": "AWS::ApiGatewayV2::Integration",
                "Properties": {
                    "ApiId": {"Ref": "HttpApi"},
                    "IntegrationType": "AWS_PROXY",
                    "IntegrationUri": {"Fn::GetAtt": ["LambdaFunction", "Arn"]},
                    "PayloadFormatVersion": "2.0"
                }
            },
            "HttpApiRoute": {
                "Type": "AWS::ApiGatewayV2::Route",
                "Properties": {
                    "ApiId": {"Ref": "HttpApi"},
                    "RouteKey": "$default",
                    "Target": {"Fn::Sub": "integrations/${HttpApiIntegration}"}
                }
            },
            "LambdaApiGatewayPermission": {
                "Type": "AWS::Lambda::Permission",
                "Properties": {
                    "FunctionName": {"Ref": "LambdaFunction"},
                    "Action": "lambda:InvokeFunction",
                    "Principal": "apigateway.amazonaws.com",
                    "SourceArn": {"Fn::Sub": "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${HttpApi}/*/*"}
                }
            }
        },
        "Outputs": {
            "ApiEndpoint": {
                "Description": "Public live HTTPS endpoint URL of the deployed stack",
                "Value": {"Fn::GetAtt": ["HttpApi", "ApiEndpoint"]},
                "Export": {"Name": {"Fn::Sub": f"{spec.name}-endpoint"}}
            },
            "TableName": {
                "Description": "DynamoDB Persistence Table",
                "Value": {"Ref": "DataTable"}
            },
            "LambdaArn": {
                "Description": "AWS Lambda Compute ARN",
                "Value": {"Fn::GetAtt": ["LambdaFunction", "Arn"]}
            }
        }
    }

    return json.dumps(template, indent=2)
