#!/usr/bin/env node
'use strict'
/**
 * Provisions Huawei Cloud services required by e-Khadi:
 *   - OBS bucket (ekhadi-files)
 *   - SMN notifications topic
 *
 * Reads:  HW_AK, HW_SK (env vars, injected by GitHub Actions)
 * Reads:  ECS metadata endpoint for project_id
 * Prints: KEY="VALUE" lines to stdout — captured by the deploy workflow
 *
 * Run from web/ directory (needs node_modules).
 */

const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3')
const { SmnClient, CreateTopicRequest, CreateTopicRequestBody, ListTopicsRequest } = require('@huaweicloud/huaweicloud-sdk-smn')
const { BasicCredentials } = require('@huaweicloud/huaweicloud-sdk-core')
const https = require('https')
const http  = require('http')

const AK          = process.env.HW_AK
const SK          = process.env.HW_SK
const BUCKET      = 'ekhadi-files'
const TOPIC_NAME  = 'ekhadi-notifications'
const REGION      = 'af-south-1'

function fetchJson(url, timeout = 5000) {
  const mod = url.startsWith('https') ? https : http
  return new Promise((resolve) => {
    const req = mod.get(url, { timeout }, (res) => {
      let data = ''
      res.on('data', (c) => { data += c })
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch { resolve(null) } })
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

async function getProjectId() {
  const meta = await fetchJson('http://169.254.169.254/openstack/2016-06-30/meta_data.json')
  return meta?.tenant_id || meta?.project_id || ''
}

async function ensureObsBucket() {
  const client = new S3Client({
    region: REGION,
    endpoint: `https://obs.${REGION}.myhuaweicloud.com`,
    credentials: { accessKeyId: AK, secretAccessKey: SK },
    forcePathStyle: false,
  })
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }))
    log(`OBS bucket "${BUCKET}" already exists`)
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: BUCKET }))
    log(`OBS bucket "${BUCKET}" created`)
  }
}

async function ensureSmnTopic(projectId) {
  const client = SmnClient.newBuilder()
    .withCredential(new BasicCredentials().withAk(AK).withSk(SK).withProjectId(projectId))
    .withEndpoint(`https://smn.${REGION}.myhuaweicloud.com`)
    .build()

  // Check for existing topic
  try {
    const listResp = await client.listTopics(new ListTopicsRequest())
    const existing = listResp.topics?.find((t) => t.name === TOPIC_NAME)
    if (existing) {
      log(`SMN topic "${TOPIC_NAME}" already exists`)
      return existing.topic_urn
    }
  } catch (e) {
    log(`SMN list failed: ${e.message} — will attempt create`)
  }

  const body = new CreateTopicRequestBody()
  body.name = TOPIC_NAME
  body.displayName = 'e-Khadi Community Notifications'

  const req = new CreateTopicRequest()
  req.body = body

  const resp = await client.createTopic(req)
  log(`SMN topic "${TOPIC_NAME}" created`)
  return resp.topic_urn
}

function log(msg) { process.stderr.write(`[setup] ${msg}\n`) }

async function main() {
  if (!AK || !SK) {
    process.stderr.write('ERROR: HW_AK and HW_SK must be set\n')
    process.exit(1)
  }

  const projectId = await getProjectId()
  log(`project_id = ${projectId || '(not found — running outside ECS)'}`)

  await ensureObsBucket()

  let topicUrn = ''
  if (projectId) {
    topicUrn = await ensureSmnTopic(projectId)
  } else {
    log('Skipping SMN — project_id unavailable outside ECS')
  }

  // Print env var assignments to stdout (captured by deploy workflow)
  const vars = [
    `OBS_ACCESS_KEY="${AK}"`,
    `OBS_SECRET_KEY="${SK}"`,
    `OBS_BUCKET="${BUCKET}"`,
    `HUAWEI_PROJECT_ID="${projectId}"`,
    `SMN_TOPIC_URN="${topicUrn}"`,
  ]
  vars.forEach((v) => process.stdout.write(v + '\n'))
}

main().catch((e) => { process.stderr.write(`FATAL: ${e.message}\n`); process.exit(1) })