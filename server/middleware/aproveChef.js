

const nodemailer = require('nodemailer');
const genericService = require('../services/genericService');

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
const joinReq = async (info) => {
  try {
    const {guid, name, email, education, experienceYears, style, additionalInfo} = info;
    
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and Email are required fields.'
      });
    }

    // Generate GUID
    // e.g., "123e4567-e89b-12d3-a456-426614174000"
  
    
    // Create simple GET URLs with GUID
    const approveUrl = `${BASE_URL}/chef/approve/${guid}`;
    const rejectUrl = `${BASE_URL}/chef/reject/${guid}`;
    
    const emailHTML = `
      <h2>New Chef Join Request - ${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Experience:</strong> ${experienceYears || 'N/A'} years</p>
      <p><strong>Education:</strong> ${education || 'N/A'}</p>
      <p><strong>Style:</strong> ${style || 'N/A'}</p>
      <p><strong>Additional Info:</strong> ${additionalInfo || 'N/A'}</p>
      
     <div style="margin: 20px 0;">
  <a href="${approveUrl}" 
     style="background-color: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-right: 12px; font-weight: 500; border: 1px solid #000000; transition: all 0.2s ease;">
    APPROVE
  </a>
  
  <a href="${rejectUrl}" 
     style="background-color: transparent; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; border: 1px solid #e5e5e5;">
    REJECT
  </a>
</div>
    `;
    
    await transporter.sendMail({
      from: 'plateandplan@gmail.com',
      to: ADMIN_EMAIL,
      subject: `New Chef Join Request - ${name}`,
      html: emailHTML
    });
    
    return true;
    
  } catch (error) {
    console.error('Error processing chef join request:', error);
    return false;
  }
};

// 2. Approval endpoint
const approveReq = async (info) => {
  try {
    const {name,email } = info;
    await sendChefApprovalEmail({ name, email });

  } catch (error) {
    console.error('Error approving chef:', error);
    
  }
};

// // 3. Rejection endpoint
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

// // Helper: Rejection email
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


module.exports = {
  joinReq,
  approveReq, // Uncomment when implemented
   rejectReq // Uncomment when implemented
};
