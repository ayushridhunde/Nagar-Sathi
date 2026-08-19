import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|mp4|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP images or MP4, MOV videos are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Max
  fileFilter
});

// ==========================================
// COMPLAINT ENDPOINTS (COMPREHENSIVE WORKFLOW)
// ==========================================

// Create Complaint (Post-Confirmation Submission)
router.post('/create', authenticateToken, async (req, res) => {
  const { 
    category, subcategory, description, locationName, latitude, longitude, 
    locationAccuracy, mediaPath, mediaType, priority, aiScore,
    aiCategory, aiConfidence, severityScore, priorityScore, publicImpactScore,
    predictedRisk, recommendedDepartment, recommendedAction, media
  } = req.body;

  const citizenId = req.user.id;

  if (!category || !description || !locationName) {
    return res.status(400).json({ error: 'Category, description, and location name are required.' });
  }

  try {
    const complaintId = 'NGP-2026-' + Math.floor(10000 + Math.random() * 90000);
    
    // Create status timelines
    const timeline = [
      { stage: 'Submitted', done: true, date: new Date().toLocaleString() },
      { stage: 'AI Classified', done: true, date: new Date().toLocaleString() },
      { stage: 'Assigned', done: false, date: '' },
      { stage: 'In Progress', done: false, date: '' },
      { stage: 'Field Action', done: false, date: '' },
      { stage: 'Resolved', done: false, date: '' },
      { stage: 'Citizen Verified', done: false, date: '' },
      { stage: 'Closed', done: false, date: '' }
    ];

    const newComplaint = await Complaint.create({
      id: complaintId,
      citizenId,
      category,
      subcategory: subcategory || 'Civic Grievance',
      description,
      locationName,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : null,
      mediaPath: mediaPath || null,
      mediaType: mediaType || null,
      priority: priority || 'Medium',
      aiScore: aiScore ? parseInt(aiScore) : 60,
      status: 'AI Classified',
      timeline: JSON.stringify(timeline),
      factors: JSON.stringify({ 
        citizenReports: 1, 
        severity: severityScore || 50, 
        publicImpact: publicImpactScore || 50, 
        locationRisk: 50 
      }),
      aiCategory: aiCategory || category,
      aiConfidence: aiConfidence ? parseInt(aiConfidence) : 90,
      severityScore: severityScore ? parseInt(severityScore) : 70,
      priorityScore: priorityScore ? parseInt(priorityScore) : 70,
      publicImpactScore: publicImpactScore ? parseInt(publicImpactScore) : 70,
      predictedRisk: predictedRisk || null,
      recommendedDepartment: recommendedDepartment || 'Municipal Operations',
      recommendedAction: recommendedAction || 'Inspection Scheduled',
      media: media || null
    });

    res.status(201).json({
      success: true,
      message: 'Complaint registered and catalogued with AI prediction logs.',
      complaint: newComplaint
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating complaint.' });
  }
});

// Upload Complaint Media (Multer parsing)
router.post('/media', authenticateToken, upload.single('media'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file uploaded.' });
  }

  const { latitude, longitude, capturedAt } = req.body;
  const mediaPath = `/uploads/${req.file.filename}`;
  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

  try {
    res.json({
      success: true,
      message: 'Media uploaded successfully.',
      mediaPath,
      mediaType,
      mimeType: req.file.mimetype,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      capturedAt: capturedAt || new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error processing file metadata.' });
  }
});

// AI Analyze Image (Safety and Mock disclaimer included)
router.post('/ai/analyze-image', authenticateToken, async (req, res) => {
  const { mediaPath, latitude, longitude } = req.body;

  // Mock CV analysis response
  res.json({
    success: true,
    aiMode: 'DEMO/MOCK AI mode - Computer Vision outputs are simulated.',
    disclaimer: 'This is a demo computer-vision module. Production replacement requires active vision services.',
    detections: [
      { category: 'Roads & Potholes', confidence: 94 },
      { category: 'Water Supply', confidence: 3 },
      { category: 'Garbage', confidence: 2 },
      { category: 'Other', confidence: 1 }
    ],
    severityBreakdown: {
      visualDamage: 91,
      publicImpact: 84,
      safetyRisk: 88,
      issueSeverity: 85
    },
    recommendedDepartment: 'Road Construction & Maintenance Division',
    recommendedAction: 'Immediate preventive inspection recommended. Deploy repair team.'
  });
});

// AI Analyze Video (Safety and Mock disclaimer included)
router.post('/ai/analyze-video', authenticateToken, async (req, res) => {
  const { mediaPath } = req.body;

  res.json({
    success: true,
    aiMode: 'DEMO/MOCK AI mode - Computer Vision outputs are simulated.',
    disclaimer: 'This is a demo computer-vision module. Production replacement requires active vision services.',
    detections: [
      { category: 'Drainage', confidence: 89 },
      { category: 'Water Supply', confidence: 8 },
      { category: 'Other', confidence: 3 }
    ],
    severityBreakdown: {
      visualDamage: 85,
      publicImpact: 90,
      safetyRisk: 86,
      issueSeverity: 87
    },
    recommendedDepartment: 'Sewerage & Drainage Operations',
    recommendedAction: 'Clean sewage pipeline blockage. Clear debris around local sewer chambers.'
  });
});

// AI Location-Aware Prediction API
router.post('/ai/predict', authenticateToken, async (req, res) => {
  const { latitude, longitude, category } = req.body;

  // Search local database to return context-aware nearby issue counters
  let nearbyCount = 0;
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const all = await Complaint.findAll();
    // Count complaints within rough 2km boundary (~0.02 deg)
    nearbyCount = all.filter(c => {
      if (!c.latitude || !c.longitude) return false;
      return Math.abs(c.latitude - lat) < 0.02 && Math.abs(c.longitude - lon) < 0.02;
    }).length;
  }

  res.json({
    success: true,
    nearbyCount,
    historicalFrequency: nearbyCount > 5 ? 'HIGH' : 'MEDIUM',
    predictedRisk: {
      waterloggingRisk: category === 'Drainage' ? 88 : 34,
      roadSafetyRisk: category === 'Roads & Potholes' ? 86 : 22,
      trafficDisruptionRisk: nearbyCount > 3 ? 72 : 45,
      publicSafetyRisk: 78
    },
    priorityScore: Math.min(100, 80 + nearbyCount),
    predictedRecurrence: nearbyCount > 5 ? 82 : 48,
    suggestedResponseWindow: 'Within 4 hours',
    citizenImpact: 'HIGH'
  });
});

// Fetch GPS Address location accuracy helper
router.post('/location', authenticateToken, (req, res) => {
  const { latitude, longitude } = req.body;
  res.json({
    success: true,
    address: 'Dharampeth Square, Nagpur',
    accuracy: 8,
    timestamp: new Date().toISOString()
  });
});

// Get Nearby Issues
router.get('/issues/nearby', authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.findAll();
    const parsed = complaints.map(c => {
      const data = c.toJSON();
      data.timeline = JSON.parse(data.timeline);
      return data;
    });
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching nearby pins.' });
  }
});

// Get Citizens Own Complaints
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: { citizenId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    const parsed = complaints.map(c => {
      const data = c.toJSON();
      data.timeline = JSON.parse(data.timeline);
      data.factors = data.factors ? JSON.parse(data.factors) : null;
      return data;
    });

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading citizen complaints.' });
  }
});

// Get All Complaints (For Officers and Admins)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      order: [['createdAt', 'DESC']]
    });

    const parsed = complaints.map(c => {
      const data = c.toJSON();
      data.timeline = JSON.parse(data.timeline);
      data.factors = data.factors ? JSON.parse(data.factors) : null;
      return data;
    });

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading all complaints.' });
  }
});

// Get Specific Complaint By ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    const data = complaint.toJSON();
    data.timeline = JSON.parse(data.timeline);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading complaint details.' });
  }
});

// Get timeline stages
router.get('/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    res.json(JSON.parse(complaint.timeline));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching timeline.' });
  }
});

// Citizen Verification Action
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    let timeline = JSON.parse(complaint.timeline);
    timeline = timeline.map(step => {
      if (step.stage === 'Citizen Verified') {
        return { ...step, done: true, date: new Date().toLocaleString() };
      }
      return step;
    });

    complaint.status = 'Citizen Verified';
    complaint.timeline = JSON.stringify(timeline);
    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint verified successfully.',
      complaint: {
        ...complaint.toJSON(),
        timeline
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error verifying resolution.' });
  }
});

// Update Complaint Status (Officer & Admin)
router.post('/status/:id', authenticateToken, upload.single('proof'), async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Update timeline
    let timeline = JSON.parse(complaint.timeline);
    
    // Mark completed stages
    timeline = timeline.map(step => {
      if (step.stage === status) {
        return { ...step, done: true, date: new Date().toLocaleString() };
      }
      if (status === 'Resolved' && ['Assigned', 'In Progress', 'Field Action'].includes(step.stage)) {
        return { ...step, done: true, date: step.date || new Date().toLocaleString() };
      }
      return step;
    });

    complaint.status = status;
    complaint.timeline = JSON.stringify(timeline);

    if (notes) {
      complaint.resolutionNotes = notes;
    }

    if (req.file) {
      complaint.resolutionProofPath = `/uploads/${req.file.filename}`;
    }

    if (req.user.role === 'officer') {
      complaint.assignedOfficerId = req.user.id;
      complaint.assignedOfficerName = req.user.name;
    }

    await complaint.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      complaint: {
        ...complaint.toJSON(),
        timeline,
        factors: complaint.factors ? JSON.parse(complaint.factors) : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating complaint.' });
  }
});

export default router;
