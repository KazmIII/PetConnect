import jwt from 'jsonwebtoken';
import { Appointment } from '../models/Appointment.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create a new appointment (Pending payment)
 *  - vetId from URL params
 *  - userId from JWT in cookie
 *  - date (YYYY-MM-DD) and slot times in request body
 *  - fee and consultationType in body
 */
export const CreateAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify JWT and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get vetId from URL
    const { vetId } = req.params;
    if (!vetId) {
      return res.status(400).json({ message: 'vetId is required in URL parameters' });
    }

    // Extract appointment details from body
    const { date, startTime, endTime, fee, consultationType } = req.body;
    if (!date || !startTime || !endTime || !fee) {
      return res.status(400).json({ message: 'Missing required appointment fields' });
    }

    // Construct and save appointment document
    const appointment = new Appointment({
      vetId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime },
      fee,
      consultationType: consultationType || 'video',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const saved = await appointment.save();
    return res.status(201).json({ message: 'Appointment created', appointment: saved });
  } catch (err) {
    console.error('Error creating appointment:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
