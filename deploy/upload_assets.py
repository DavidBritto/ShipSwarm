"""Upload built frontend assets to S3 website bucket and invalidate CloudFront cache."""

import mimetypes
import os
import time
import boto3

BUCKET_NAME = "shipswarm-frontend-585929637997"
DISTRIBUTION_ID = "E32SRSMQI9XROF"
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

s3 = boto3.client("s3", region_name="us-east-1")
cf = boto3.client("cloudfront", region_name="us-east-1")

print(f"Uploading files from {DIST_DIR} to s3://{BUCKET_NAME}...")

for root, _, files in os.walk(DIST_DIR):
    for filename in files:
        filepath = os.path.join(root, filename)
        relpath = os.path.relpath(filepath, DIST_DIR)
        
        content_type, _ = mimetypes.guess_type(filepath)
        if filename.endswith(".css"):
            content_type = "text/css"
        elif filename.endswith(".js"):
            content_type = "application/javascript"
        elif filename.endswith(".svg"):
            content_type = "image/svg+xml"
        elif filename.endswith(".html"):
            content_type = "text/html"
        elif filename.endswith(".jpg") or filename.endswith(".jpeg"):
            content_type = "image/jpeg"
            
        content_type = content_type or "application/octet-stream"
        
        print(f"  Uploading {relpath} ({content_type})...")
        with open(filepath, "rb") as f:
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=relpath,
                Body=f,
                ContentType=content_type,
            )

print("All frontend assets uploaded successfully to S3!")
print(f"S3 Website Origin: http://{BUCKET_NAME}.s3-website-us-east-1.amazonaws.com")

print(f"Invalidating CloudFront distribution {DISTRIBUTION_ID}...")
try:
    inv = cf.create_invalidation(
        DistributionId=DISTRIBUTION_ID,
        InvalidationBatch={
            "Paths": {
                "Quantity": 1,
                "Items": ["/*"],
            },
            "CallerReference": f"shipswarm-deploy-{int(time.time())}",
        },
    )
    invalidation_id = inv["Invalidation"]["Id"]
    print(f"CloudFront invalidation created: {invalidation_id}")
    print("Live Global CDN URL: https://d8zyfvd7p1wi8.cloudfront.net")
except Exception as e:
    print(f"Warning: CloudFront invalidation failed: {e}")
