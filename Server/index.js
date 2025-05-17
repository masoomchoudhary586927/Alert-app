const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Validate required environment variables
const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

// ✅ Load Twilio credentials from environment
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// ✅ Rate limiter middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use(express.json());
app.use(limiter);

// ✅ Secure CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// ✅ Input validation for SMS
const validateSMSRequest = [
  check('to')
    .notEmpty().withMessage('To is required')
    .isMobilePhone('any', { strictMode: true }).withMessage('Invalid phone number format'),
  check('message').notEmpty().withMessage('Message is required').isString().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Invalid input', errors: errors.array() });
    }
    next();
  }
];

// ✅ Secure SMS endpoint
app.post('/api/send-sms', validateSMSRequest, async (req, res) => {
  const { to, message } = req.body;

  // ✅ Replace this with your list of allowed numbers (array)
  const allowedNumbers = ['+917415360209'];

  if (allowedNumbers.length > 0 && !allowedNumbers.includes(to)) {
    return res.status(403).json({ success: false, message: 'Unauthorized recipient number' });
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log(`SMS sent to ${to} (SID: ${result.sid})`);
    res.json({ success: true, sid: result.sid, message: 'SMS sent successfully' });

  } catch (error) {
    console.error('Twilio Error:', error);

    let errorMessage = 'Failed to send SMS';
    if (error.code === 21211) errorMessage = 'Invalid phone number';
    if (error.code === 21614) errorMessage = 'Invalid Twilio credentials';

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    });
  }
});

// ✅ Simulated email endpoint
app.post('/api/send-email', (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ success: false, message: 'Missing email parameters' });
  }

  try {
    console.log(`Simulated email to ${to}, subject: ${subject}, text: ${text}`);
    setTimeout(() => {
      console.log('Email sent (simulated)');
      res.json({ success: true, message: 'Email sent successfully' });
    }, 500);

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// ✅ General error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
