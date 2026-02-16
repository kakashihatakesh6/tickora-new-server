export const getPasswordResetTemplate = (otp: string, name: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: #4f46e5;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 32px;
      color: #374151;
    }
    .welcome-text {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .otp-container {
      text-align: center;
      margin: 32px 0;
      padding: 24px;
      background-color: #f5f3ff;
      border-radius: 12px;
      border: 1px dashed #818cf8;
    }
    .otp-code {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 32px;
      font-weight: 700;
      color: #4f46e5;
      letter-spacing: 4px;
    }
    .instruction-text {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin-top: 16px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #9ca3af;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TicketMaster</h1>
    </div>
    <div class="content">
      <p class="welcome-text">Hi ${name},</p>
      <p>We received a request to reset your password. Use the verification code below to complete the process. This code will expire in 15 minutes.</p>
      
      <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <p class="instruction-text">Do not share this code with anyone.</p>
      </div>

      <p style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TicketMaster. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;
};
