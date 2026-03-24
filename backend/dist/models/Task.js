"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const User_1 = __importDefault(require("./User"));
class Task extends sequelize_1.Model {
}
Task.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 200],
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('todo', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'todo',
    },
    priority: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
    },
    due_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'tasks',
});
// Associations
Task.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'owner' });
User_1.default.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
exports.default = Task;
//# sourceMappingURL=Task.js.map