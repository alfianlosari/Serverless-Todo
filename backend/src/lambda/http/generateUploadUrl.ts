import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { parseAuthorizationHeader, parseUserId } from '../../auth/utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateSignedURL')

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  if (!todoId) {
    logger.info("todoId is not provided")
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Please provide todo id in the url path"
      })
    }
  }

  const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
  const userId = parseUserId(jwtToken)

  logger.info('Generating signed url for userId with todoId', userId, todoId)

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: `${userId}:${todoId}`,
    Expires: urlExpiration
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    }, null, 2)
  }
})

handler.use(cors())

