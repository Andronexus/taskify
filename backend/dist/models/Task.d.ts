import { Model, Optional } from 'sequelize';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export interface TaskAttributes {
    id: number;
    user_id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'priority' | 'due_date'> {
}
declare class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    id: number;
    user_id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Task;
//# sourceMappingURL=Task.d.ts.map