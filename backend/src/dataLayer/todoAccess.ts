import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS) as any

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('todoAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) { }


    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting Todos for userId', userId)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items;
        return items as TodoItem[]
    }


    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Creating Todos for userId', todo.userId)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
        logger.info('Updating Todos for userId and todoId', userId, todoId)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return todo

    }

    async updateTodoImageUrl(imageUrl: string, userId: string, todoId: string): Promise<any> {
        logger.info('Updating Todos attachmentUrl for userId and todoId', userId, todoId, imageUrl)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: "set attachmentUrl = :imageUrl",
            ExpressionAttributeValues: {
                ":imageUrl": imageUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return null

    }

    async deleteTodo(todoId: string, userId: string): Promise<any> {
        logger.info('deleting Todos for userId and todoId', userId, todoId)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
        return null
    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}