const { S3Client } = require('@aws-sdk/client-s3');
const { IVSClient } = require('@aws-sdk/client-ivs');

// S3 configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// IVS configuration
const ivs = new IVSClient({
  region: process.env.IVS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

module.exports = {
  s3,
  ivs
};
