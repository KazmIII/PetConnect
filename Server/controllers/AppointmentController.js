import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";  
import { Appointment } from "../models/Appointment.js";
import { UserModel } from "../models/User.js";
import { VetModel } from "../models/Vet.js";

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
    const vet = await VetModel.findById(vetId);
    if (!vet) {
      return res.status(404).json({ message: "Vet not found" });
    }

    if (!vetId || !date || !startTime || !endTime || !fee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

     // only video slots get a roomID
     let roomID = null;
     if (consultationType === "video") {
       roomID = uuidv4();
     }

    // 1) Create appointment in Mongo with pending payment
    const appointment = await Appointment.create({
      vetId,
      userId,
      date: new Date(date),
      slot: { startTime, endTime, status: 'pending' },
      fee,
      consultationType: consultationType,
      roomID,  
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
            currency: "pkr",
            product_data: {
              name: `Consultation with Dr. ${vet.name}`,
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

    const updatedAppt = await Appointment.findById(apptId);
    if (!updatedAppt) {
      console.log("❌ Appointment not found in database:", apptId);
      return res.status(404).json({ error: "Appointment not found" });
    }

    updatedAppt.status = "booked";
    updatedAppt.paymentStatus = "paid";
    updatedAppt.slot.status = "booked";
    await updatedAppt.save();


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
        'slot.status': 'booked',
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

// export const GetUserAppointments = async (req, res) => {
//   const token = req.cookies.pet_ownerToken;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });
  
//   try {
//     const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    
//     const appointments = await Appointment.find({
//       userId,
//       paymentStatus: "paid",
//       status: "booked"
//     })
//     // populate vet’s name so you don’t have to client‑side fetch it separately
//     .populate("vetId", "name");

//     res.json(appointments);
//   } catch (err) {
//     console.error("Error in GetUserAppointments:", err);
//     if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ message: "Invalid token" });
//     }
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// export const GetVetAppointments = async (req, res) => {
//   // 1) Grab the vet’s JWT from cookies
//   const token = req.cookies.vetToken;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     // 2) Verify & extract vetId
//     const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);

//     // 3) Query appointments for this vet that are paid & booked
//     const appointments = await Appointment.find({
//       vetId,
//       paymentStatus: "paid",
//       status:        "booked",
//     })
//       .populate("userId", "name email")    // bring in the user’s name & email
//       .sort({ date: 1, "slot.startTime": 1 })
//       .lean();

//     // 4) Send them back
//     return res.json(appointments);
//   } catch (err) {
//     console.error("Error in GetVetAppointments:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// in the same controller file…

export const GetUserAppointments = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const appointments = await Appointment.find({
      userId,
      paymentStatus: "paid",
      status:        { $in: ["booked","in-progress"] }
    })
    .populate("vetId", "name roomID")
    .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetUserAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetVetAppointments = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const appointments = await Appointment.find({
      vetId,
      paymentStatus: "paid",
      status:        { $in: ["booked","in-progress"] }
    })
    .populate("userId", "name email")
    .sort({ date: 1, "slot.startTime": 1 })
    .lean();

    res.json(appointments);
  } catch (err) {
    console.error("Error in GetVetAppointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const StartAppointment = async (req, res) => {
  const token = req.cookies.vetToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { id: vetId } = jwt.verify(token, process.env.JWT_SECRET);
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (appt.vetId.toString() !== vetId)
      return res.status(403).json({ message: "Not allowed" });

    appt.status = 'in-progress';
    await appt.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error in StartAppointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

