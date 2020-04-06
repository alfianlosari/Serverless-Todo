import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos';
import { parseAuthorizationHeader } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
  const item = await createTodo(newTodo, jwtToken)

  logger.info("Created new todo", item)

  return {
    statusCode: 200,
    body: JSON.stringify({
      item
    }, null, 2)
  }
})

handler.use(cors())
