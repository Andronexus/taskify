import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = process.env.DB_PATH || './taskflow.db';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(dbPath),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;
