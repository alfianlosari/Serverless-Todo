import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
import { parseAuthorizationHeader } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

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
  await deleteTodo(todoId, jwtToken)

  logger.info("deleted todo", todoId)

  return {
    statusCode: 200,
    body: null
  }
})

handler.use(cors())