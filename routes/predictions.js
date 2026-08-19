import express from 'express';
import Prediction from '../models/Prediction.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get AI Civic Risk Forecast
router.get('/', authenticateToken, async (req, res) => {
  try {
    const list = await Prediction.findAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error loading predictions' });
  }
});

// Update prediction action status (Admin trigger action)
router.post('/action/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pred = await Prediction.findByPk(id);
    if (!pred) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    pred.status = status || 'Action Initiated';
    await pred.save();

    res.json({ success: true, prediction: pred });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error triggering action' });
  }
});

export default router;
