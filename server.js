import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Database config
import sequelize from './config/db.js';

// Models
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Prediction from './models/Prediction.js';
import Notification from './models/Notification.js';
import Media from './models/Media.js';

// Routes
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import predictionRoutes from './routes/predictions.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/chat', chatRoutes);

// Base Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Nagar Sathi AI Smart Civic Action API Server is running.' });
});

// Database Synchronization & Initial Seeding
const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // sync models. Use force: true only to reset database on reboot if needed
    console.log('Database synced successfully.');

    // 1. Seed Default Officer
    const officerExists = await User.findOne({ where: { role: 'officer' } });
    if (!officerExists) {
      const hashedPassword = await bcrypt.hash('officerpass', 10);
      await User.create({
        id: 'NMC-OFF-402',
        role: 'officer',
        name: 'Officer Rajesh Patil',
        email: 'officer@nmc.nagpur.gov.in',
        officialId: 'NMC-OFF-402',
        password: hashedPassword,
        department: 'Water Works Dept'
      });
      console.log('Seed: Created default municipal officer account.');
    }

    // 2. Seed Default Admin
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      await User.create({
        id: 'NMC-ADMIN-01',
        role: 'admin',
        name: 'Chief Admin Commissioner',
        email: 'admin@nmc.nagpur.gov.in',
        adminId: 'NMC-ADMIN-01',
        password: hashedPassword,
      });
      console.log('Seed: Created default administrator account.');
    }

    // 3. Seed Default Complaints
    const complaintsCount = await Complaint.count();
    if (complaintsCount === 0) {
      const baseComplaints = [
        {
          id: "NGP-2026-00124",
          citizenId: "CIT-89241",
          category: "Water Supply",
          subcategory: "Water Pipeline Leakage",
          locationName: "Dharampeth, Nagpur",
          latitude: 21.1425,
          longitude: 79.0601,
          priority: "High",
          aiScore: 87,
          description: "Main water supply pipeline leaking near Dharampeth square. Water logging is starting to occur on the main road.",
          status: "In Progress",
          assignedOfficerId: "NMC-OFF-402",
          assignedOfficerName: "Officer Rajesh Patil",
          timeline: JSON.stringify([
            { stage: "Submitted", done: true, date: "2026-08-15 09:30 AM" },
            { stage: "AI Classified", done: true, date: "2026-08-15 09:32 AM" },
            { stage: "Assigned", done: true, date: "2026-08-16 11:00 AM" },
            { stage: "Field Action", done: true, date: "2026-08-17 08:30 AM" },
            { stage: "Resolved", done: false, date: "" }
          ]),
          factors: JSON.stringify({ citizenReports: 25, severity: 30, populationImpact: 20, historicalFrequency: 10, locationRisk: 2 })
        },
        {
          id: "NGP-2026-00125",
          citizenId: "CIT-89241",
          category: "Roads & Potholes",
          subcategory: "Large Potholes Cluster",
          locationName: "Wardha Road, Near Airport Metro Station",
          latitude: 21.0924,
          longitude: 79.0664,
          priority: "Critical",
          aiScore: 94,
          description: "Huge potholes causing traffic bottleneck and near-miss accidents on the main flyover link to Wardha Road.",
          status: "Submitted",
          timeline: JSON.stringify([
            { stage: "Submitted", done: true, date: "2026-08-17 07:15 AM" },
            { stage: "AI Classified", done: true, date: "2026-08-17 07:18 AM" },
            { stage: "Assigned", done: false, date: "" },
            { stage: "Field Action", done: false, date: "" },
            { stage: "Resolved", done: false, date: "" }
          ]),
          factors: JSON.stringify({ citizenReports: 30, severity: 35, populationImpact: 25, historicalFrequency: 2, locationRisk: 2 })
        },
        {
          id: "NGP-2026-00118",
          citizenId: "CIT-89242",
          category: "Garbage",
          subcategory: "Unauthorized Dump Site",
          locationName: "Mahal, Nagpur",
          latitude: 21.1444,
          longitude: 79.1118,
          priority: "Medium",
          aiScore: 68,
          description: "Garbage piled up near the historic Mahal gateway. Severe odor and stray animal gathering.",
          status: "Resolved",
          assignedOfficerId: "NMC-OFF-402",
          assignedOfficerName: "Officer Rajesh Patil",
          timeline: JSON.stringify([
            { stage: "Submitted", done: true, date: "2026-08-12 10:00 AM" },
            { stage: "AI Classified", done: true, date: "2026-08-12 10:05 AM" },
            { stage: "Assigned", done: true, date: "2026-08-12 02:00 PM" },
            { stage: "Field Action", done: true, date: "2026-08-13 09:00 AM" },
            { stage: "Resolved", done: true, date: "2026-08-14 04:30 PM" }
          ]),
          factors: JSON.stringify({ citizenReports: 12, severity: 15, populationImpact: 15, historicalFrequency: 20, locationRisk: 6 })
        }
      ];

      for (const comp of baseComplaints) {
        await Complaint.create(comp);
      }
      console.log('Seed: Loaded initial complaints table.');
    }

    // 4. Seed Default Predictions
    const predictionsCount = await Prediction.count();
    if (predictionsCount === 0) {
      const basePredictions = [
        {
          id: "PRED-001",
          type: "Waterlogging Risk",
          location: "Wardha Road, Nagpur",
          riskLevel: "Critical",
          riskPercentage: 91,
          timeframe: "Next 24–48 hours",
          description: "Meteorological forecast indicates high-intensity precipitation (50mm+). Historic drainage flow data and topological mapping suggest a 91% probability of severe waterlogging in low-lying sections of Wardha Road.",
          recommendedAction: "Pre-position drainage response team and clear catch basins at underpass points.",
          category: "Drainage",
          status: "Action Suggested"
        },
        {
          id: "PRED-002",
          type: "Road Damage Risk",
          location: "Hingna Road, Nagpur",
          riskLevel: "High",
          riskPercentage: 82,
          timeframe: "Next 3-5 days",
          description: "Heavy multi-axle freight traffic combined with recent micro-cracking reports on Hingna Road points to active asphalt degradation and immediate pothole development risk.",
          recommendedAction: "Schedule pre-emptive road inspection and micro-surfacing repair crews.",
          category: "Roads & Potholes",
          status: "Inspection Scheduled"
        },
        {
          id: "PRED-003",
          type: "Garbage Overflow Risk",
          location: "Mahal Market Area, Nagpur",
          riskLevel: "High",
          riskPercentage: 76,
          timeframe: "Next 24 hours",
          description: "Upcoming local festival bazaar expected to double daily retail footfall in Mahal, overloading current sanitation dump bins by 76% above peak capacity.",
          recommendedAction: "Increase garbage truck collection frequency to 3 times daily and place auxiliary bins.",
          category: "Garbage",
          status: "Action Initiated"
        }
      ];

      for (const pred of basePredictions) {
        await Prediction.create(pred);
      }
      console.log('Seed: Loaded initial AI predictive analytics records.');
    }

  } catch (err) {
    console.error('Database Sync Error:', err);
  }
};

// Start Server
seedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Nagar Sathi Express Server listening on port ${PORT} `);
    console.log(`=======================================================`);
  });
});
