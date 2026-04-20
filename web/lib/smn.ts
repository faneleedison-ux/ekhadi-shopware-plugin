// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SmnClient, PublishMessageRequest, PublishMessageRequestBody } = require('@huaweicloud/huaweicloud-sdk-smn')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BasicCredentials } = require('@huaweicloud/huaweicloud-sdk-core')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.error('SMN publish failed:', err)
  }
}