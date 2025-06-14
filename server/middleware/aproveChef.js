

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
    const {guid, name, email,imageURL, education, experienceYears, style, additionalInfo} = info;
    
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
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: #000000; color: white; padding: 30px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">New Chef Application</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px;">
      
      <!-- Chef Image -->
      ${imageURL ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${imageURL}" 
               alt="Chef ${name}" 
               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        </div>
      ` : ''}
      
      <!-- Chef Name -->
      <h2 style="color: #000000; font-size: 28px; font-weight: 700; margin: 0 0 30px 0; text-align: center;">
        ${name}
      </h2>
      
      <!-- Details Grid -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
        
        <div style="display: grid; gap: 20px;">
          
          <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 15px;">
            <strong style="color: #000000; font-weight: 600; display: block; margin-bottom: 5px;">Email:</strong>
            <span style="color: #6c757d; font-size: 16px;">${email}</span>
          </div>
          
          <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 15px;">
            <strong style="color: #000000; font-weight: 600; display: block; margin-bottom: 5px;">Experience:</strong>
            <span style="color: #6c757d; font-size: 16px;">${experienceYears || 'N/A'} years</span>
          </div>
          
          <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 15px;">
            <strong style="color: #000000; font-weight: 600; display: block; margin-bottom: 5px;">Education:</strong>
            <span style="color: #6c757d; font-size: 16px;">${education || 'N/A'}</span>
          </div>
          
          <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 15px;">
            <strong style="color: #000000; font-weight: 600; display: block; margin-bottom: 5px;">Cooking Style:</strong>
            <span style="color: #6c757d; font-size: 16px;">${style || 'N/A'}</span>
          </div>
          
          <div>
            <strong style="color: #000000; font-weight: 600; display: block; margin-bottom: 5px;">Additional Information:</strong>
            <span style="color: #6c757d; font-size: 16px; line-height: 1.5;">${additionalInfo || 'N/A'}</span>
          </div>
          
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveUrl}" 
           style="background-color: #000000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-right: 15px; font-weight: 600; display: inline-block; min-width: 120px;">
          APPROVE
        </a>
        
        <a href="${rejectUrl}" 
           style="background-color: transparent; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; border: 2px solid #e5e5e5; display: inline-block; min-width: 120px;">
          REJECT
        </a>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        Chef Management System
      </p>
    </div>
    
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
