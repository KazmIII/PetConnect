// EmailTemplate.js

// Verification email template
export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with us! To complete your registration, please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not sign up, no further action is required. Feel free to <a href="mailto:support@yourcompany.com">contact our support team</a> if you have any questions.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

// Reset password email template
export const Reset_Password_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .reset-code {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Password Reset Request</div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Please use the code below to reset your password:</p>
              <span class="reset-code">{resetCode}</span>
              <p>If you did not request a password reset, no further action is required. If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact our support team</a>.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
