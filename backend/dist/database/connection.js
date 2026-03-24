"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const dbPath = process.env.DB_PATH || './taskflow.db';
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: path_1.default.resolve(dbPath),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
});
exports.default = sequelize;
//# sourceMappingURL=connection.js.map