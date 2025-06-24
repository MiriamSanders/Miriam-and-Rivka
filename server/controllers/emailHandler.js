

const nodemailer = require('nodemailer');
const userService = require('../services/userService');
const { log } = require('console');
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_ADRESS,
    pass: process.env.EMAIL_API_PASSWORD
  }
});
const BASE_URL = 'http://localhost:3001';
const getAdminEmail = async () => {
  const admin = await userService.getAdmin();
  return admin.email;
}
// 1. Endpoint to receive chef join requests
const joinReq = async (info) => {
  try {
    const { guid, name, email, imageURL, education, experienceYears, style, additionalInfo } = info;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and Email are required fields.'
      });
    }


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
      to: await getAdminEmail(),
      subject: `New Chef Join Request - ${name}`,
      html: emailHTML
    });

    return true;

  } catch (error) {
    console.error('Error processing chef join request:', error);
    return false;
  }
}
// 2. Approval endpoint
const approveReq = async (info) => {
  try {
    const { name, email } = info;
    await sendChefApprovalEmail({ name, email });

  } catch (error) {
    console.error('Error approving chef:', error);
  }
}
// // 3. Rejection endpoint
const rejectReq = async ({ name, email, reason }) => {
  try {
    if (!name || !email) {
      throw new Error("unable to create email");
    }

    await sendChefRejectionEmail({ name, email, reason });

    return true;

  } catch (error) {
    console.error('Error rejecting chef:', error);
    throw new Error('Failed to process rejection.');
  }
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
async function createAndSendShoppingListEmail({ userEmail, shoppingListItems, dates, weeklyMenu, userId }) {
  try {
    // Generate shopping list HTML
    let emailBodyItems = '';
    shoppingListItems.forEach(item => {
      emailBodyItems += `<li>${item}</li>`;
    });

    // Helper function for calendar date formatting
    function parseDateToISOString(regularDate, hour = 9, durationInMinutes = 60) {
      const date = new Date(regularDate + "T" + String(hour).padStart(2, '0') + ":00:00");
      const start = new Date(date);
      const end = new Date(date.getTime() + durationInMinutes * 60000);

      const formatDate = d =>
        d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return { start: formatDate(start), end: formatDate(end) };
    }

    // Generate calendar links HTML
    const calendarLinksHtml = dates
      .filter((_, index) => weeklyMenu[index])
      .map(({ regularDate, formatted }, index) => {
        const dayMenu = weeklyMenu[index];
        const recipeLinks = `
            Side: ${dayMenu.side.title}: http://localhost:5173/recipes/${dayMenu.side.recipeId}
            Main: ${dayMenu.main.title}: http://localhost:5173/recipes/${dayMenu.main.recipeId}
            Dessert: ${dayMenu.dessert.title}: http://localhost:5173/recipes/${dayMenu.dessert.recipeId}
        `;

        const { start, end } = parseDateToISOString(regularDate);
        const title = encodeURIComponent("Meal Planning Reminder");
        const details = encodeURIComponent(`Today's Menu:\n${recipeLinks}\n\nDon't forget to check your meal plan and prep ingredients!`);
        const location = encodeURIComponent("Your Kitchen");
        const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;

        return `<li class="meal-plan-item">
      <a href="${link}" 
       target="_blank" 
       class="calendar-link modern-btn glassmorphism dark-mode" 
       style="
           position: relative;
           display: inline-flex;
           align-items: center;
           gap: 12px;
           padding: 16px 24px;
           background: rgba(18, 18, 18, 0.8);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.1);
           color: #ffffff;
           text-decoration: none;
           border-radius: 16px;
           font-weight: 500;
           font-size: 15px;
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
           box-shadow: 
               0 8px 32px rgba(0, 0, 0, 0.12),
               inset 0 1px 0 rgba(255, 255, 255, 0.1);
           cursor: pointer;
           overflow: hidden;
           min-width: 240px;
           justify-content: center;
       "
       onmouseover="
           this.style.transform='translateY(-4px) scale(1.02)'; 
           this.style.background='rgba(255, 255, 255, 0.05)';
           this.style.borderColor='rgba(255, 255, 255, 0.2)';
           this.style.boxShadow='0 16px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
       "
       onmouseout="
           this.style.transform='translateY(0) scale(1)'; 
           this.style.background='rgba(18, 18, 18, 0.8)';
           this.style.borderColor='rgba(255, 255, 255, 0.1)';
           this.style.boxShadow='0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
       "
       data-event-type="meal-planning"
       aria-label="Add meal planning reminder to Google Calendar"
       rel="noopener noreferrer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Add ${formatted}'s menu to calendar</span>
    </a>
</li>`;
      }).join('');

    // Generate complete HTML email content
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px ; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
                    <h1 style="color: #333; margin: 0;">Your Weekly Shopping List 🛒</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="color: #555; line-height: 1.6;">Hello there!</p>
                    <p style="color: #555; line-height: 1.6;">Here's a comprehensive list of ingredients you'll need for your upcoming delicious meals:</p>
                    <ul style="list-style-type: disc; padding-left: 20px; margin: 20px 0;">
                        ${emailBodyItems}
                    </ul>
                    <p style="color: #555; line-height: 1.6;">Don't forget to grab everything you need for a smooth cooking week!</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #555;">Add reminders to your Google Calendar:</p>
                        <ul style="list-style-type: none; padding: 0;">
                            ${calendarLinksHtml}
                        </ul>
                    </div>
                </div>
                <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                    <p style="margin: 0;">Happy cooking from the Plan & Plate Team!</p>
                </div>
            </div>
        `;

    // Send the email
    const emailResult = await transporter.sendMail({
      from: 'plateandplan@gmail.com',
      to: userEmail,
      subject: `Grocery List - Enjoy Planning An Amazing Menu!`,
      html: htmlContent
    });
    return {
      success: true,
      message: "Shopping list email sent successfully.",
      messageId: emailResult.messageId
    };

  } catch (error) {
    console.error("Error creating or sending shopping list email:", error);
    return {
      success: false,
      message: "Failed to send shopping list email.",
      error: error.message
    };
  }
}
async function resetPasswordEmail(email, resetToken) {
  await transporter.sendMail({
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="http://localhost:5173/reset-password/${resetToken}">here</a> to reset your password.</p>`
  });

  return { message: "Reset email sent" };
}
module.exports = {
  joinReq,
  approveReq, // Uncomment when implemented
  rejectReq,
  createAndSendShoppingListEmail,// Uncomment when implemented
  resetPasswordEmail
};
