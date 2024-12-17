import { transporter } from "./Email.config.js";
import { Verification_Email_Template, Reset_Password_Email_Template } from "./EmailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

// Function to send verification email
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: "Verify your Email", // Subject line
      text: "Please Verify your Email", // plain text body
      html: Verification_Email_Template.replace("{verificationCode}", verificationCode), // Replace placeholder with verification code
    });
    console.log('Verification email sent successfully', response);
  } catch (error) {
    console.log('Error sending verification email', error);
  }
};

// Function to send reset password email
export const sendResetPasswordEmail = async (email, resetCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: "Password Reset Request", // Subject line
      text: "We received a request to reset your password. Use the code below to reset it.", // plain text body
      html: Reset_Password_Email_Template.replace("{resetCode}", resetCode), // Replace placeholder with reset code
    });
    console.log('Password reset email sent successfully', response);
  } catch (error) {
    console.log('Error sending password reset email', error);
  }
};

