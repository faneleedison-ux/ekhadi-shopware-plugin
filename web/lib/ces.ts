/* eslint-disable */
const { CesClient, CreateMetricDataRequest, CreateMetricDataRequestBody, MetricInfo, MetricsDimension } = require('@huaweicloud/huaweicloud-sdk-ces')
const { BasicCredentials } = require('@huaweicloud/huaweicloud-sdk-core')

function getClient() {
  return CesClient.newBuilder()
    .withCredential(
      new BasicCredentials()
        .withAk(process.env.OBS_ACCESS_KEY!)
        .withSk(process.env.OBS_SECRET_KEY!)
        .withProjectId(process.env.HUAWEI_PROJECT_ID!)
    )
    .withEndpoint('https://ces.af-south-1.myhuaweicloud.com')
    .build()
}

function buildDataPoint(metricName: string, value: number, unit: string) {
  const dim = new MetricsDimension()
  dim.name = 'app'
  dim.value = 'ekhadi-web'

  const mi = new MetricInfo()
  mi.namespace = 'eKhadi'
  mi.metric_name = metricName
  mi.dimensions = [dim]

  const body = new CreateMetricDataRequestBody()
  body.metric = mi
  body.ttl = 172800
  body.collect_time = Date.now()
  body.value = value
  return body
}

export async function reportMetric(metricName: string, value: number, unit = 'Count'): Promise<void> {
  if (!process.env.HUAWEI_PROJECT_ID || !process.env.OBS_ACCESS_KEY) return
  try {
    const request = new CreateMetricDataRequest()
    request.body = [buildDataPoint(metricName, value, unit)]
    await getClient().createMetricData(request)
  } catch (err) {
    console.error('[CES] metric push failed:', err)
  }
}

export async function reportMetrics(points: Array<{ name: string; value: number; unit?: string }>): Promise<void> {
  if (!process.env.HUAWEI_PROJECT_ID || !process.env.OBS_ACCESS_KEY) return
  try {
    const request = new CreateMetricDataRequest()
    request.body = points.map((p) => buildDataPoint(p.name, p.value, p.unit ?? 'Count'))
    await getClient().createMetricData(request)
  } catch (err) {
    console.error('[CES] batch metric push failed:', err)
  }
}
