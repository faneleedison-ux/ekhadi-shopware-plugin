import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const obsClient = new S3Client({
  region: 'af-south-1',
  endpoint: 'https://obs.af-south-1.myhuaweicloud.com',
  credentials: {
    accessKeyId: process.env.OBS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.OBS_SECRET_KEY ?? '',
  },
  forcePathStyle: false,
})

const BUCKET = process.env.OBS_BUCKET ?? 'ekhadi-images'

export async function uploadToOBS(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await obsClient.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return `https://${BUCKET}.obs.af-south-1.myhuaweicloud.com/${key}`
}

export { obsClient, BUCKET }