import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD) {
  // PostgreSQL configuration if environment variables are provided
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
  console.log('Database Config: Configuring PostgreSQL client connection...');
} else {
  // Fallback to SQLite for zero-setup execution
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
  });
  console.log('Database Config: SQLite database loaded at server/database.sqlite');
}

export default sequelize;
