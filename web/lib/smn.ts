/* eslint-disable */
const { SmnClient, PublishMessageRequest, PublishMessageRequestBody, CreateSubscriptionRequest, CreateSubscriptionRequestBody } = require('@huaweicloud/huaweicloud-sdk-smn')
const { BasicCredentials } = require('@huaweicloud/huaweicloud-sdk-core')

function getClient(): any {
  return SmnClient.newBuilder()
    .withCredential(
      new BasicCredentials()
        .withAk(process.env.OBS_ACCESS_KEY!)
        .withSk(process.env.OBS_SECRET_KEY!)
        .withProjectId(process.env.HUAWEI_PROJECT_ID!)
    )
    .withEndpoint('https://smn.af-south-1.myhuaweicloud.com')
    .build()
}

// Broadcast notification to the admin/ops topic (fire and forget)
export async function publishSMN(subject: string, message: string): Promise<void> {
  if (!process.env.SMN_TOPIC_URN || !process.env.HUAWEI_PROJECT_ID) return
  try {
    const request = new PublishMessageRequest()
    request.topicUrn = process.env.SMN_TOPIC_URN
    const body = new PublishMessageRequestBody()
    body.subject = subject
    body.message = message
    request.body = body
    await getClient().publishMessage(request)
  } catch (err) {
    console.error('[SMN] publish failed:', err)
  }
}

// Add a member's phone or email as a topic subscriber so they receive future broadcasts
export async function subscribeToTopic(
  endpoint: string,
  protocol: 'sms' | 'email',
  remark?: string
): Promise<void> {
  if (!process.env.SMN_TOPIC_URN || !process.env.HUAWEI_PROJECT_ID) return
  try {
    const request = new CreateSubscriptionRequest()
    request.topicUrn = process.env.SMN_TOPIC_URN
    const body = new CreateSubscriptionRequestBody()
    body.protocol = protocol
    body.endpoint = endpoint
    if (remark) body.remark = remark
    request.body = body
    await getClient().createSubscription(request)
  } catch (err) {
    // Duplicate subscriptions return a 400 — safe to ignore
    const msg = (err as any)?.message ?? ''
    if (!msg.includes('already')) console.error('[SMN] subscribe failed:', err)
  }
}