const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Get credentials from .env file
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const PORT = process.env.PORT || 5000;

console.log('🔍 Environment Variables Check:');
console.log('EMAIL_USER:', EMAIL_USER ? '✅ Loaded' : '❌ NOT LOADED');
console.log('EMAIL_PASSWORD:', EMAIL_PASSWORD ? '✅ Loaded' : '❌ NOT LOADED');
console.log('ALERT_EMAIL:', ALERT_EMAIL ? '✅ Loaded' : '❌ NOT LOADED');
console.log('PORT:', PORT);

// Middleware with proper CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://velen-o7nr.onrender.com',
      'https://velen-sigma.vercel.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Allowed users list
const ALLOWED_USERS = [
 'shiva',
 'paglu',
];

// Email configuration
let transporter;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error("❌ Email credentials missing in environment variables");
  transporter = null;
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email server connection failed:", error);
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });
}

// Function to send unauthorized access alert email
const sendUnauthorizedAlert = async (attemptedName, ip, timestamp) => {
  try {
    if (!transporter) {
      console.log("⚠️ Email transporter not configured");
      return false;
    }

    if (!ALERT_EMAIL) {
      console.log("⚠️ ALERT_EMAIL not set");
      return false;
    }

    const mailOptions = {
      from: `"Valentine Security 💝" <${EMAIL_USER}>`,
      to: ALERT_EMAIL,
      subject: "🚨 Unauthorized Access Attempt",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2 style="color:#e74c3c;">⚠️ Unauthorized Access Alert</h2>
          <p><strong>Name Attempted:</strong> ${attemptedName}</p>
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Status:</strong> ❌ Access DENIED</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Alert email sent successfully");
    console.log("Message ID:", info.messageId);

    return true;

  } catch (error) {
    console.error("❌ FULL Email Sending Error:");
    console.error(error);
    return false;
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running! ✅', 
    timestamp: new Date(),
    email: EMAIL_USER 
  });
});

// API endpoint to verify user
app.post('/api/verify-user', async (req, res) => {
  console.log('📥 Received verify-user request');
  
  try {
    const { name } = req.body;
    console.log('👤 Name received:', name);

    if (!name || name.trim() === '') {
      console.log('❌ Empty name received');
      return res.json({ 
        success: false, 
        message: 'Please enter your name! 💔' 
      });
    }

    // Check if user is in allowed list
    const isAllowed = ALLOWED_USERS.some(
      allowedName => allowedName.toLowerCase() === name.toLowerCase().trim()
    );

    if (isAllowed) {
      // User is authorized
      console.log(`✅ User authenticated: ${name}`);
      return res.json({ 
        success: true, 
        userName: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        message: 'Welcome! 💕' 
      });
    } else {
      // User is NOT authorized - Send alert email
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
      
      
      // Send email alert asynchronously 
   sendUnauthorizedAlert(name, clientIp, timestamp);

console.log(`❌ Unauthorized access attempt: ${name}`);
return res.json({ 
  success: false, 
  message: 'Access Denied! You are not on the special list 💔' 
});
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║  💝 Valentine Server Started! 💝   ║
  ║  Server running on port ${PORT}         ║
  ║  http://localhost:${PORT}          ║
  ║  CORS Enabled for localhost:5173    ║
  ╚════════════════════════════════════╝
  `);
  console.log('📝 Allowed users:', ALLOWED_USERS);
  console.log('📧 Alert email:', ALERT_EMAIL);
  console.log('🚀 Ready to receive requests!');
});

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
