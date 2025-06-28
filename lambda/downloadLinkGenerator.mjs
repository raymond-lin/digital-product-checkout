import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.S3_BUCKET;

export async function generateDownloadLink(s3ObjectKey) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3ObjectKey,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 1800 }); // URL expires in 30 minutes
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Could not generate download link.');
  }
}
