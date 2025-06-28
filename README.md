# Digital Product Checkout with AWS Lambda

## Overview
This project provides a serverless checkout system for digital products using AWS services:

- **AWS Lambda** (Node.js v22+) for backend logic  
- **API Gateway (HTTP API)** to expose REST endpoints  
- **S3** for static frontend hosting and digital product storage  
- **SES** for sending payment confirmation emails  
- **DynamoDB** for order transaction records  
- **PayPal API** for payment processing  

## Architecture

```
User -> S3 Frontend -> API Gateway -> Lambda (checkout logic) -> DynamoDB, SES, PayPal
```

## Key Features

- Supports multiple digital products with individual prices and download files  
- Creates and captures PayPal orders securely  
- Records purchase transactions in DynamoDB  
- Sends customizable email receipts with download links and checksum info via SES  
- Generates time-limited signed URLs for secure file downloads  

## Code Structure

- `lambda/index.mjs`: Main Lambda handler for order creation and capture  
- `lambda/programCatalog.mjs`: Configuration file listing product details (price, SKU, S3 key)  
- `lambda/paypal.mjs`: PayPal API integration helper functions  
- `lambda/dbHandler.mjs`: DynamoDB transaction recording  
- `lambda/emailNotifier.mjs`: SES email sending logic  
- `lambda/downloadLinkGenerator.mjs`: Generates pre-signed S3 URLs for downloads  
- `frontend/`: Static website files to be hosted on S3  

## Deployment & Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/raymond-lin/digital-product-checkout.git
   cd digital-product-checkout
   ```

2. Configure AWS CLI and create IAM roles with permissions for Lambda, API Gateway, DynamoDB, S3, SES.

3. Create DynamoDB table and S3 bucket, and upload product files to S3 with the correct keys.

4. Create PayPal REST app and note the `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`.

5. Set SES verified email addresses for `FROM_EMAIL` and `ADMIN_EMAIL`.

6. Set the following environment variables for Lambda functions:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_SECRET`
   - `BASE_URL` (e.g., `https://yourdomain.com/`)
   - `PAYPAL_API_HOST` (e.g., `api-m.sandbox.paypal.com` or `api-m.paypal.com`)
   - `DYNAMODB_TABLE`
   - `S3_BUCKET`
   - `AWS_REGION`
   - `FROM_NAME`
   - `FROM_EMAIL`
   - `ADMIN_EMAIL`

7. Deploy Lambda functions manually or using preferred Infrastructure as Code (IaC) tool.

8. Deploy frontend static files to the S3 bucket configured for website hosting.

## Environment Variables Example

Create a `.env.example` file for local testing reference:

```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
BASE_URL=https://yourdomain.com/
PAYPAL_API_HOST=api-m.sandbox.paypal.com
DYNAMODB_TABLE=your-dynamodb-table-name
S3_BUCKET=your-s3-bucket-name
AWS_REGION=your-aws-region
FROM_NAME=YourSiteName
FROM_EMAIL=from-email@example.com
ADMIN_EMAIL=admin-email@example.com
```

## How to Test

- Use the frontend hosted on S3 to initiate purchases.  
- The Lambda functions will create and capture PayPal orders.  
- Upon successful purchase, users receive an email with a time-limited download link.  

