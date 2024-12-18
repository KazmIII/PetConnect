import { sendVerificationEmail, sendResetPasswordEmail} from "../middleware/Email.js";
import { UserModel } from "../models/User.js";
import {PetModel} from '../models/Pet.js';
import {ClinicModel} from '../models/Clinic.js'; 
import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { SitterModel } from "../models/Sitter.js";
import MemoryBook from '../models/MemoryBook.js';
import Memory from '../models/Memory.js'; 

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp'; // For image processing

export const AdminLogin = async (req, res) => {
  console.log("in admin login route");
  const { email, password } = req.body;

  // Validate email and password
  if (email === process.env.ADMIN_EMAIL) {
    const isMatch = bcryptjs.compareSync(password, process.env.ADMIN_PASSWORD); // Synchronous comparison
    if (isMatch) {
      console.log("login successful");

      const payload = { email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.cookie('adminToken', token, {
        httpOnly: true,  
        maxAge: 7 * 24 * 60 * 60 * 1000,  // Cookie expiration (7 days)
        path: "/", 
      });

      // Respond with a success message
      return res.status(200).json({ message: "Login successful!" });
    } else {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } else {
    console.log("Invalid credentials");
    return res.status(400).json({ message: "Invalid credentials" });
  }
};

export const VerifyAdmin = (req, res) => {
    const token = req.cookies.adminToken; // Get token from cookies
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      res.status(200).json({ message: "Token is valid", admin: decoded });
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };

// Get Pending Clinics Requests
export const GetPendingClinics = async (req, res) => {
try {
    const pendingClinics = await ClinicModel.find({
    verificationStatus: 'pending',
    emailVerified: true,
    });
    return res.status(200).json({ success: true, clinics: pendingClinics });
} catch (error) {
    console.error('Error fetching pending clinics:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
}
};

export const GetPendingSitters = async (req, res) => {
try {
    const pendingSitters = await SitterModel.find({
    verificationStatus: 'pending',
    emailVerified: true,
    });
    return res.status(200).json({ success: true, sitters: pendingSitters });
} catch (error) {
    console.error('Error fetching pending sitters:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
}
};

// Update Clinic Verfication Status
export const UpdateClinicVerificationStatus = async (req, res) => {
  try {
    const { clinicId, status } = req.body; // Status can be 'verified' or 'rejected'

    if (!clinicId || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid data provided.' });
    }

    const clinic = await ClinicModel.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found.' });
    }

    clinic.verificationStatus = status;
    await clinic.save();

    return res.status(200).json({
      success: true,
      message: `Clinic ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating clinic verification status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Sitter Verfication Status
export const UpdateSitterVerificationStatus = async (req, res) => {
  try {
    const { sitterId, status } = req.body; 

    // Validate inputs
    if (!sitterId || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid data provided.' });
    }

    const sitter = await SitterModel.findById(sitterId);
    if (!sitter) {
      return res.status(404).json({ success: false, message: `Sitter not found.` });
    }

    sitter.verificationStatus = status;
    await sitter.save();

    return res.status(200).json({
      success: true,
      message: `Sitter ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const GetClinicDetails = async (req, res) => {
  try {
    const { clinicName } = req.params;

    // Find the clinic by its name
    const clinic = await ClinicModel.findOne({ clinicName });

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // Convert file buffers to Base64 for rendering on the frontend
    const clinicDetails = {
      clinicName: clinic.clinicName,
      email: clinic.email,
      phone: clinic.phone,
      city: clinic.city,
      address: clinic.address,
      verificationStatus: clinic.verificationStatus,
      clinicRegistrationFile: clinic.clinicRegistrationFile.toString("base64"),
      NICFile: clinic.NICFile.toString("base64"),
      vetLicenseFile: clinic.vetLicenseFile.toString("base64"),
      proofOfAddressFile: clinic.proofOfAddressFile.toString("base64"),
    };

    res.status(200).json({ clinic: clinicDetails });
  } catch (error) {
    console.error("Error fetching clinic details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetSitterDetails = async (req, res) => {
    console.log("In sitter detail route");
    try {
      const { sitterId } = req.params;
      console.log("In sitter detail route, the sitter ID is:", sitterId);
  
      // Fetch the sitter details
      const sitter = await SitterModel.findById(sitterId).lean();
  
      if (!sitter) {
        return res.status(404).json({ message: "Sitter not found" });
      }
      console.log("the return object is: ", sitter);
      return res.status(200).json({ sitter });
    } catch (error) {
      console.error("Error fetching sitter details:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const GetRegisteredUsers = async (req, res) => {
  try {
    const registeredUsers = await UserModel.find({ emailVerified: true }); 
    return res.status(200).json({ success: true, users: registeredUsers });
  } catch (error) {
    console.error('Error fetching registered users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const GetRegisteredVets = async (req, res) => {
  try {
    const registeredVets = await VetModel.find({ verificationStatus: "verified" }); 
    return res.status(200).json({ success: true, vets: registeredVets });
  } catch (error) {
    console.error('Error fetching registered vets:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 

export const GetRegisteredGroomers = async (req, res) => {
  try {
    const registeredGroomers = await GroomerModel.find({ verificationStatus: "verified" }); 
    return res.status(200).json({ success: true, groomers: registeredGroomers });
  } catch (error) {
    console.error('Error fetching registered groomers:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 

export const GetRegisteredSitters = async (req, res) => {
  try {
    const registeredSitters = await SitterModel.find({ verificationStatus: "verified" }); 
    return res.status(200).json({ success: true, sitters: registeredSitters });
  } catch (error) {
    console.error('Error fetching registered sitters:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 