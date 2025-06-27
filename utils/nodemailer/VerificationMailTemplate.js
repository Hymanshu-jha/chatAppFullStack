function generateVerificationEmail({ username, verificationLink }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .card-shadow {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.08);
        }
        
        .button-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: all 0.3s ease;
        }
        
        .button-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .checkmark {
          display: inline-block;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          border-radius: 50%;
          position: relative;
          margin: 0 auto 20px;
        }
        
        .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 28px;
          font-weight: bold;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
      
      <!-- Outer container with gradient background -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            
            <!-- Main email container -->
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(255, 255, 255, 0.95); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.08);">
              
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; position: relative;">
                  <div style="background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1440 320\"><path fill=\"%23ffffff\" fill-opacity=\"0.1\" d=\"M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,133.3C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\"></path></svg>') no-repeat bottom; background-size: cover; padding: 50px 30px 80px; text-align: center;">
                    <div class="checkmark"></div>
                    <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Welcome to <span style="background: linear-gradient(45deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">chatApp</span> ✨
                    </h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0; font-weight: 400;">You're almost ready to get started!</p>
                  </div>
                </td>
              </tr>
              
              <!-- Main content -->
              <tr>
                <td style="padding: 50px 40px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 15px;">Hi ${username}! 👋</h2>
                    <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                      Thanks for joining our community! We're excited to have you on board. 
                      Just one more step to activate your account.
                    </p>
                  </div>
                  
                  <!-- Verification button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 30px; border-radius: 16px; margin-bottom: 30px;">
                      <div style="background: white; padding: 20px; border-radius: 12px; border: 2px dashed #d1d5db; margin-bottom: 20px;">
                        <p style="color: #374151; font-size: 14px; margin: 0; font-weight: 500;">🔐 Secure Email Verification</p>
                      </div>
                      <a href="${verificationLink}" 
                         style="
                           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                           color: white;
                           padding: 16px 40px;
                           text-decoration: none;
                           border-radius: 12px;
                           display: inline-block;
                           font-size: 18px;
                           font-weight: 600;
                           box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                           transition: all 0.3s ease;
                           text-transform: uppercase;
                           letter-spacing: 0.5px;
                         ">
                        ✅ Verify My Email
                      </a>
                    </div>
                  </div>
                  
                  <!-- Additional info -->
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                      💡 <strong>Quick tip:</strong> This verification link will expire in 24 hours for security reasons.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
                      If you didn't create an account with chatApp, you can safely ignore this email.<br>
                      Having trouble? Contact our support team at <a href="mailto:support@chatapp.com" style="color: #667eea; text-decoration: none;">support@chatapp.com</a>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; text-align: center;">
                  <div style="margin-bottom: 20px;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 25px; margin: 0 5px;">
                      <span style="color: white; font-size: 12px; font-weight: 500;">🚀 Fast & Secure</span>
                    </div>
                    <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 25px; margin: 0 5px;">
                      <span style="color: white; font-size: 12px; font-weight: 500;">🔒 Privacy First</span>
                    </div>
                  </div>
                  
                  <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} chatApp. All rights reserved.
                  </p>
                  <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 5px 0 0;">
                    Made with ❤️ for amazing conversations
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export default generateVerificationEmail;