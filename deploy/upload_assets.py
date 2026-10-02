"""Upload built frontend assets to S3 website bucket."""

import mimetypes
import os
import boto3

BUCKET_NAME = "shipswarm-frontend-585929637997"
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

s3 = boto3.client("s3", region_name="us-east-1")

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
            
        content_type = content_type or "application/octet-stream"
        
        print(f"  Uploading {relpath} ({content_type})...")
        with open(filepath, "rb") as f:
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=relpath,
                Body=f,
                ContentType=content_type,
            )

print("All frontend assets uploaded successfully!")
print(f"Public Live Website: http://{BUCKET_NAME}.s3-website-us-east-1.amazonaws.com")
