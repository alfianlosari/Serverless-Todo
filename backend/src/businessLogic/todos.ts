import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userid = parseUserId(jwtToken)
    return todoAccess.getAllTodos(userid)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await todoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    })
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken)

    return await todoAccess.updateTodo(todoId, {
        name: updateTodoRequest.name,
        done: updateTodoRequest.done,
        dueDate: updateTodoRequest.dueDate
    }, userId)
}

export async function updateTodoImageUrl(imageUrl: string, userId: string, todoId: string): Promise<any> {
    return todoAccess.updateTodoImageUrl(imageUrl, userId, todoId)
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
): Promise<any> {
    const userId = parseUserId(jwtToken)
    return await todoAccess.deleteTodo(todoId, userId)
}