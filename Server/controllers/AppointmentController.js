// import jwt from 'jsonwebtoken';
// import { Appointment } from '../models/Appointment.js';
// import dotenv from 'dotenv';

// dotenv.config();

// /**
//  * Create a new appointment (Pending payment)
//  *  - vetId from URL params
//  *  - userId from JWT in cookie
//  *  - date (YYYY-MM-DD) and slot times in request body
//  *  - fee and consultationType in body
//  */
// export const CreateAppointment = async (req, res) => {
//   const token = req.cookies.pet_ownerToken;
//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   try {
//     // Verify JWT and extract user ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     // Get vetId from URL
//     const { vetId } = req.params;
//     if (!vetId) {
//       return res.status(400).json({ message: 'vetId is required in URL parameters' });
//     }

//     // Extract appointment details from body
//     const { date, startTime, endTime, fee, consultationType } = req.body;
//     if (!date || !startTime || !endTime || !fee) {
//       return res.status(400).json({ message: 'Missing required appointment fields' });
//     }

//     // Construct and save appointment document
//     const appointment = new Appointment({
//       vetId,
//       userId,
//       date: new Date(date),
//       slot: { startTime, endTime },
//       fee,
//       consultationType: consultationType || 'video',
//       status: 'pending',
//       paymentStatus: 'pending'
//     });

//     const saved = await appointment.save();
//     return res.status(201).json({ message: 'Appointment created', appointment: saved });
//   } catch (err) {
//     console.error('Error creating appointment:', err);
//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { Appointment } from "../models/Appointment.js";
import { UserModel } from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const CreateAppointment = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { vetId } = req.params;
    const { date, startTime, endTime, fee, consultationType } = req.body;

    if (!vetId || !date || !startTime || !endTime || !fee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1) Create appointment in Mongo with pending payment
    const appointment = await Appointment.create({
      vetId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime },
      fee,
      consultationType: consultationType || "video",
      status: "pending",
      paymentStatus: "pending",
    });

    // 2) Lookup the user’s email for the Stripe receipt
    const user = await UserModel.findById(userId);

    // 3) Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with Vet ${vetId}`,
              description: `On ${date} at ${startTime}–${endTime}`,
            },
            unit_amount: Math.round(fee * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { appointmentId: appointment._id.toString() },
      success_url: `${process.env.FRONTEND_URL}/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/appointments/cancel?appointmentId=${appointment._id}`,
    });

    // 4) Save the session ID on the appointment (optional)
    appointment.stripeSessionId = session.id;
    await appointment.save();

    // 5) Send back the URL for the front‐end to redirect the user
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error in CreateAppointment:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// After your CreateAppointment…

export const ConfirmAppointment = async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    console.log("❌ Missing session_id");
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("✅ Retrieved session:", session);

    const apptId = session.metadata?.appointmentId;

    if (!apptId) {
      console.log("❌ No appointmentId found in session metadata");
      return res.status(400).json({ error: "Missing appointmentId in session metadata" });
    }

    const updatedAppt = await Appointment.findByIdAndUpdate(apptId, {
      paymentStatus: "paid",
      status: "booked",
    });

    if (!updatedAppt) {
      console.log("❌ Appointment not found in database:", apptId);
      return res.status(404).json({ error: "Appointment not found" });
    }

    console.log("✅ Appointment updated successfully");
    res.json({ success: true });

  } catch (err) {
    console.error("🔥 Error in ConfirmAppointment:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const StripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Construct event to verify the signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // If the webhook signature is invalid, return a 400 error
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Check if appointmentId exists in session metadata
    const apptId = session.metadata.appointmentId;
    if (!apptId) {
      console.error("No appointmentId in session metadata");
      return res.status(400).send("Appointment ID not found");
    }

    try {
      // Update appointment status in your database
      await Appointment.findByIdAndUpdate(apptId, {
        paymentStatus: "paid",
        status: "booked",
      });

      console.log(`Appointment ${apptId} has been booked and paid.`);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      return res.status(500).send("Failed to update appointment status");
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  // Send response to acknowledge receipt of webhook
  res.json({ received: true });
};

