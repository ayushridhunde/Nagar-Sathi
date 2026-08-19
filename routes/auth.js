import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendMsg91Otp, verifyMsg91Otp, retryMsg91Otp } from '../services/smsService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nagar_sathi_super_secret_key_2026';

import crypto from 'crypto';

// Helper to generate secure random 6-digit OTP
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateOTP = generateSecureOTP;

// Helper to hash OTP using SHA256
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Mask mobile number helper (+91 XXXXXXX3210)
const maskMobile = (mobile) => {
  const normalized = mobile.replace(/\D/g, '');
  const lastFour = normalized.slice(-4);
  return `+91 XXXXXXX${lastFour}`;
};

// ==========================================
// SECURE CITIZEN AUTHENTICATION (Mobile + OTP)
// ==========================================

// Send OTP
router.post('/citizen/auth/send-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  // Validate Indian mobile numbers
  const indianMobileRegex = /^(?:\+91|91)?[789]\d{9}$/;
  if (!indianMobileRegex.test(mobile)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const hasCredentials = process.env.MSG91_AUTH_KEY && 
                         process.env.MSG91_TEMPLATE_ID && 
                         !process.env.MSG91_AUTH_KEY.includes('YOUR_');

  try {
    const rawOtp = generateSecureOTP();
    const otp_hash = hashOTP(rawOtp);
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ where: { mobile, role: 'citizen' } });
    if (!user) {
      user = await User.create({
        id: 'CIT-' + Math.floor(10000 + Math.random() * 90000),
        role: 'citizen',
        name: 'Citizen ' + mobile.slice(-4),
        mobile,
      });
    }

    // Cooldown check: 30 seconds resend restriction
    if (user.lastSentAt && (Date.now() - new Date(user.lastSentAt).getTime() < 30 * 1000)) {
      return res.status(429).json({ error: 'Please wait 30 seconds before requesting another OTP.' });
    }

    // Dispatches actual SMS via MSG91 API client if credentials exist, otherwise logs to terminal.
    if (hasCredentials) {
      try {
        await sendMsg91Otp(mobile, rawOtp);
      } catch (smsErr) {
        console.error('MSG91 OTP Error:', smsErr.message);
        return res.status(503).json({ error: 'OTP could not be sent. Please try again.' });
      }
    } else {
      console.log(`\n🔑 [DEVELOPMENT MSG91 SMS GATEWAY]`);
      console.log(`To: ${mobile}`);
      console.log(`OTP Code: ${rawOtp}`);
      console.log(`(This log is hidden in production. Set MSG91_AUTH_KEY in .env to send real SMS.)\n`);
    }

    user.otpHash = otp_hash;
    user.otpExpiry = otp_expires_at;
    user.attemptCount = 0;
    user.lastSentAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: hasCredentials 
        ? `OTP sent successfully to ${maskMobile(mobile)}`
        : `OTP sent successfully to ${maskMobile(mobile)}. (Demo Code: ${rawOtp})`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP could not be sent. Please try again.' });
  }
});

// Verify OTP
router.post('/citizen/auth/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP code are required.' });
  }

  try {
    const user = await User.findOne({ where: { mobile, role: 'citizen' } });
    if (!user || !user.otpHash) {
      return res.status(400).json({ error: 'No active OTP verification session found.' });
    }

    // Attempt count check (Max 5 attempts)
    if (user.attemptCount >= 5) {
      return res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Expiry check
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new OTP.' });
    }

    // Verify OTP using MSG91 API (production) or hash mapping (development)
    const hasCredentials = process.env.MSG91_AUTH_KEY && 
                           process.env.MSG91_TEMPLATE_ID && 
                           !process.env.MSG91_AUTH_KEY.includes('YOUR_');

    if (hasCredentials) {
      try {
        await verifyMsg91Otp(mobile, otp);
      } catch (verifyErr) {
        user.attemptCount += 1;
        await user.save();
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      }
    } else {
      const inputHash = hashOTP(otp);
      if (user.otpHash !== inputHash) {
        user.attemptCount += 1;
        await user.save();
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      }
    }

    // Invalidate OTP post verification
    user.otpHash = null;
    user.otpExpiry = null;
    user.attemptCount = 0;
    await user.save();

    // Generate authenticated citizen token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error verifying OTP code.' });
  }
});

// Resend OTP (Alias with invalidation triggers)
router.post('/citizen/auth/resend-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  try {
    const user = await User.findOne({ where: { mobile, role: 'citizen' } });
    if (user) {
      // Invalidate current session
      user.otpHash = null;
      user.otpExpiry = null;
      await user.save();
    }

    // Redirect to send-otp handler
    req.url = '/citizen/auth/send-otp';
    return router.handle(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error resetting OTP verification.' });
  }
});

// Logout endpoint
router.post('/citizen/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});


// ==========================================
// MUNICIPAL OFFICER AUTH (Official ID + Password + OTP)
// ==========================================

// Step 1: Officer Password login
router.post('/officer/login', async (req, res) => {
  const { officialId, password } = req.body;
  if (!officialId || !password) {
    return res.status(400).json({ error: 'Official ID and Password are required' });
  }

  try {
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { officialId: officialId },
          { email: officialId }
        ],
        role: 'officer' 
      } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid Official ID or Email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect Password' });
    }

    // Credentials valid, send OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    console.log(`[OTP SERVICE MOCK] Sent OTP ${otp} to Officer ${user.name}`);

    res.json({
      success: true,
      message: 'Password verified. OTP sent successfully.',
      otp // Returing mock OTP
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Step 2: Officer OTP verification
router.post('/officer/verify-otp', async (req, res) => {
  const { officialId, otp } = req.body;
  if (!officialId || !otp) {
    return res.status(400).json({ error: 'Official ID and OTP are required' });
  }

  try {
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { officialId: officialId },
          { email: officialId }
        ],
        role: 'officer' 
      } 
    });

    if (!user) {
      return res.status(404).json({ error: 'Officer profile not found' });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired. Please try logging in again.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

// ==========================================
// ADMINISTRATOR AUTH (Admin ID + Password + OTP)
// ==========================================

// Step 1: Admin Password login
router.post('/admin/login', async (req, res) => {
  const { adminId, password } = req.body;
  if (!adminId || !password) {
    return res.status(400).json({ error: 'Admin ID and Password are required' });
  }

  try {
    const user = await User.findOne({ where: { adminId, role: 'admin' } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid Admin ID' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect Password' });
    }

    // Credentials valid, send OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    console.log(`[OTP SERVICE MOCK] Sent OTP ${otp} to Admin ${user.name}`);

    res.json({
      success: true,
      message: 'Password verified. OTP sent successfully.',
      otp // Mocked OTP
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Step 2: Admin OTP verification
router.post('/admin/verify-otp', async (req, res) => {
  const { adminId, otp } = req.body;
  if (!adminId || !otp) {
    return res.status(400).json({ error: 'Admin ID and OTP are required' });
  }

  try {
    const user = await User.findOne({ where: { adminId, role: 'admin' } });
    if (!user) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired. Please login again.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

// Get Current Logged-in User Info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      mobile: user.mobile,
      email: user.email,
      department: user.department
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching user details' });
  }
});

export default router;
