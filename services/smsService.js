import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Read .env dynamically to apply updates without server restart
const reloadEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  } catch (e) {
    console.error('Dynamic Env Load Error:', e);
  }
};

/**
 * Normalize mobile numbers to Indian country code prefix (e.g. 917724950362)
 */
const normalizeIndianMobile = (mobile) => {
  let cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
};

/**
 * MSG91: Send OTP API
 */
export const sendMsg91Otp = async (mobile, otp) => {
  reloadEnv();
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    throw new Error('SMS service is temporarily unavailable. Please try again later.');
  }

  const formattedMobile = normalizeIndianMobile(mobile);
  const msg91Url = 'https://control.msg91.com/api/v5/otp';
  
  const params = new URLSearchParams();
  params.append('template_id', templateId);
  params.append('mobile', formattedMobile);
  params.append('authkey', authKey);
  params.append('otp', otp);

  const res = await fetch(`${msg91Url}?${params.toString()}`, {
    method: 'POST'
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('MSG91 OTP Transmission Error:', errText);
    throw new Error('OTP could not be sent. Please try again.');
  }

  const data = await res.json();
  if (data.type !== 'success') {
    console.error('MSG91 OTP Rejected:', data.message);
    throw new Error('OTP could not be sent. Please try again.');
  }

  return true;
};

/**
 * MSG91: Verify OTP API
 */
export const verifyMsg91Otp = async (mobile, otp) => {
  reloadEnv();
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    throw new Error('SMS verification service is temporarily unavailable.');
  }

  const formattedMobile = normalizeIndianMobile(mobile);
  const msg91Url = 'https://control.msg91.com/api/v5/otp/verify';

  const params = new URLSearchParams();
  params.append('otp', otp);
  params.append('mobile', formattedMobile);
  params.append('authkey', authKey);

  const res = await fetch(`${msg91Url}?${params.toString()}`);
  if (!res.ok) {
    const errText = await res.text();
    console.error('MSG91 OTP Verification Error:', errText);
    throw new Error('Invalid OTP.');
  }

  const data = await res.json();
  if (data.type !== 'success') {
    console.error('MSG91 OTP Verification Failed:', data.message);
    throw new Error('Invalid OTP.');
  }

  return true;
};

/**
 * MSG91: Resend OTP API
 */
export const retryMsg91Otp = async (mobile) => {
  reloadEnv();
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    throw new Error('SMS service is temporarily unavailable. Please try again later.');
  }

  const formattedMobile = normalizeIndianMobile(mobile);
  const msg91Url = 'https://control.msg91.com/api/v5/otp/retry';

  const params = new URLSearchParams();
  params.append('authkey', authKey);
  params.append('mobile', formattedMobile);
  params.append('retrytype', 'text');

  const res = await fetch(`${msg91Url}?${params.toString()}`, {
    method: 'POST'
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('MSG91 OTP Retry Error:', errText);
    throw new Error('OTP could not be sent. Please try again.');
  }

  const data = await res.json();
  if (data.type !== 'success') {
    console.error('MSG91 OTP Retry Rejected:', data.message);
    throw new Error('OTP could not be sent. Please try again.');
  }

  return true;
};
