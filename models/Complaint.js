import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  citizenId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  locationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  mediaPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: true, // 'image' | 'video'
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false, // 'Critical' | 'High' | 'Medium' | 'Low'
  },
  aiScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assignedOfficerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignedOfficerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false, // 'Submitted' | 'AI Classified' | 'Assigned' | 'In Progress' | 'Field Action' | 'Resolved' | 'Citizen Verified' | 'Closed'
    defaultValue: 'Submitted',
  },
  timeline: {
    type: DataTypes.TEXT,
    allowNull: false, // JSON string representing history events
  },
  factors: {
    type: DataTypes.TEXT,
    allowNull: true, // JSON string representing priority factors
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolutionProofPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reportedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  locationAccuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  aiCategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aiConfidence: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  severityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priorityScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  publicImpactScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  predictedRisk: {
    type: DataTypes.TEXT, // JSON string or text
    allowNull: true,
  },
  recommendedDepartment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recommendedAction: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  media: {
    type: DataTypes.TEXT, // JSON string storing associated media list
    allowNull: true,
  }
});

export default Complaint;
