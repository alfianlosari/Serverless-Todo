import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { parseAuthorizationHeader } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
  const todoUpdate = await updateTodo(todoId, updatedTodo, jwtToken)

  logger.info('updated todo', todoUpdate)
  return {
    statusCode: 200,
    body: JSON.stringify({
      item: todoUpdate
    }, null, 2)
  }
})

handler.use(cors())
