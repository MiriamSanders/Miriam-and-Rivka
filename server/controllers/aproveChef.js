const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Correct createTransport usage
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: 'plateandplan@gmail.com',
    pass: 'qaerwevjnfrdcdja' // Your Gmail App Password (no spaces)
  }
});

const ADMIN_EMAIL = 'miriamsanders2005@gmail.com';
const BASE_URL = 'http://localhost:3001';

// 1. Endpoint to receive chef join requests
const joinReq = async (req, res) => {
  try {
    const { name, email, phone, experience, specialties, bio } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ 
        error: 'Name, email, and phone are required fields.' 
      });
    }

    const approveUrl = `${BASE_URL}/api/chef/approve`;
    const rejectUrl = `${BASE_URL}/api/chef/reject`;

    const emailHTML = `
      <h2>New Chef Join Request</h2>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Experience:</strong> ${experience || 'N/A'}</li>
        <li><strong>Specialties:</strong> ${specialties || 'N/A'}</li>
        <li><strong>Bio:</strong> ${bio || 'N/A'}</li>
      </ul>
      <h3>To Approve:</h3>
      <pre>POST ${approveUrl}
{
  "name": "${name}",
  "email": "${email}",
  "phone": "${phone}",
  "experience": "${experience || ''}",
  "specialties": "${specialties || ''}",
  "bio": "${bio || ''}"
}</pre>
      <h3>To Reject:</h3>
      <pre>POST ${rejectUrl}
{
  "email": "${email}",
  "name": "${name}"
}</pre>
    `;

    await transporter.sendMail({
      from: 'plateandplan@gmail.com',
      to: ADMIN_EMAIL,
      subject: `New Chef Join Request - ${name}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Your chef join request has been submitted successfully.'
    });

  } catch (error) {
    console.error('Error processing chef join request:', error);
    res.status(500).json({ error: 'Failed to process join request.' });
  }
};

// 2. Approval endpoint
const apoveReq = async (req, res) => {
  try {
    const { name, email, phone, experience, specialties, bio } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const chefData = await createChef({ name, email, phone, experience, specialties, bio });
    await sendChefApprovalEmail({ name, email });

    res.json({ message: 'Chef approved successfully.', chef: chefData });

  } catch (error) {
    console.error('Error approving chef:', error);
    res.status(500).json({ error: 'Failed to approve chef.' });
  }
};

// 3. Rejection endpoint
const rejectReq = async (req, res) => {
  try {
    const { name, email, reason } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    await sendChefRejectionEmail({ name, email, reason });

    res.json({ message: 'Chef rejection processed successfully.' });

  } catch (error) {
    console.error('Error rejecting chef:', error);
    res.status(500).json({ error: 'Failed to process rejection.' });
  }
};

// Helper: Create chef (dummy function)
async function createChef(chefData) {
  const newChef = {
    id: Date.now(),
    ...chefData,
    status: 'active',
    joinedAt: new Date()
  };
  console.log('Creating chef:', newChef);
  return newChef;
}

// Helper: Approval email
async function sendChefApprovalEmail({ name, email }) {
  const emailHTML = `
    <h2>Welcome to Plate & Plan!</h2>
    <p>Dear ${name},</p>
    <p>Congratulations! Your application has been approved.</p>
    <p>You're now ready to join our culinary community.</p>
    <p>— Plate & Plan Team</p>
  `;

  await transporter.sendMail({
    from: 'plateandplan@gmail.com',
    to: email,
    subject: `Welcome to Plate & Plan, ${name}!`,
    html: emailHTML
  });
}

// Helper: Rejection email
async function sendChefRejectionEmail({ name, email, reason }) {
  const emailHTML = `
    <h2>Application Status</h2>
    <p>Dear ${name},</p>
    <p>Unfortunately, your application was not approved.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Thank you for your interest in Plate & Plan.</p>
  `;

  await transporter.sendMail({
    from: 'plateandplan@gmail.com',
    to: email,
    subject: 'Your Plate & Plan Application',
    html: emailHTML
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Plate & Plan chef join request server running on port ${PORT}`);
});

module.exports = {
  joinReq,
  apoveReq,
  rejectReq
};
