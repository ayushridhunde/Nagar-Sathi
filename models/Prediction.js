import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Prediction = sequelize.define('Prediction', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  riskLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  riskPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timeframe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recommendedAction: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

export default Prediction;
