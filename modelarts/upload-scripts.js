#!/usr/bin/env node
/**
 * Uploads ModelArts training scripts (train.py, customize_service.py)
 * from modelarts/credit-scorer/ to OBS.
 *
 * Usage:
 *   HW_AK="..." HW_SK="..." node modelarts/upload-scripts.js
 */
'use strict'

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const fs   = require('fs')
const path = require('path')

const AK     = process.env.HW_AK || process.env.OBS_ACCESS_KEY
const SK     = process.env.HW_SK || process.env.OBS_SECRET_KEY
const BUCKET = 'ekhadi-files'

if (!AK || !SK) { console.error('HW_AK and HW_SK required'); process.exit(1) }

const s3 = new S3Client({
  region: 'af-south-1',
  endpoint: 'https://obs.af-south-1.myhuaweicloud.com',
  credentials: { accessKeyId: AK, secretAccessKey: SK },
  forcePathStyle: false,
})

const scripts = [
  { local: 'modelarts/credit-scorer/train.py',               key: 'modelarts/code/train.py' },
  { local: 'modelarts/credit-scorer/customize_service.py',   key: 'modelarts/code/customize_service.py' },
]

const root = path.resolve(__dirname, '..')

async function upload() {
  for (const s of scripts) {
    const body = fs.readFileSync(path.join(root, s.local))
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key:    s.key,
      Body:   body,
      ContentType: 'text/plain',
    }))
    console.log(`Uploaded obs://${BUCKET}/${s.key}`)
  }
}

upload().catch(e => { console.error(e); process.exit(1) })