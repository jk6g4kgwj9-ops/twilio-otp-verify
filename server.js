require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Twilio Client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Validation Helper
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?1?\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

const formatPhoneNumber = (phone) => {
  if (!phone.startsWith('+')) {
    return '+1' + phone.replace(/[^0-9]/g, '').slice(-10);
  }
  return phone.replace(/[^+0-9]/g, '');
};

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// 1. SEND OTP (Verify Service)
app.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use +1XXXXXXXXXX or 10 digits'
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    const verification = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms'
      });

    res.json({
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      status: verification.status,
      phone: formattedPhone
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP'
    });
  }
});

// 2. VERIFY OTP
app.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and code are required'
      });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    const result = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code: code.toString()
      });

    res.json({
      success: result.status === 'approved',
      status: result.status,
      message: result.status === 'approved' ? 'OTP verified successfully' : 'Invalid OTP'
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify OTP'
    });
  }
});

// 3. SEND SMS MESSAGE (Using Twilio Programmable Messaging)
app.post('/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number and message are required'
      });
    }

    if (!validatePhoneNumber(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    const formattedPhone = formatPhoneNumber(to);

    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    res.json({
      success: true,
      message: 'SMS sent successfully',
      sid: sms.sid,
      status: sms.status
    });
  } catch (error) {
    console.error('Send SMS Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS'
    });
  }
});

// 4. CHECK VERIFICATION STATUS
app.post('/check-verification-status', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    const verification = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.list({
        to: formattedPhone,
        limit: 1
      });

    if (verification.length === 0) {
      return res.json({
        success: false,
        message: 'No verification found for this phone number'
      });
    }

    res.json({
      success: true,
      status: verification[0].status,
      phone: formattedPhone
    });
  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check status'
    });
  }
});

// 5. RESEND OTP
app.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    const formattedPhone = formatPhoneNumber(phone);

    const verification = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms'
      });

    res.json({
      success: true,
      message: `OTP resent to ${formattedPhone}`,
      status: verification.status
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend OTP'
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred'
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
