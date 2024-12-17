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
import svgCaptcha from "svg-captcha";

// export const GenerateCaptcha = async (req, res) => {
//   const captcha = svgCaptcha.create({
//     size: 6, // Number of characters
//     noise: 3, // Add noise for better security
//     background: "#FFDAB9", // Background color
//     color: false, // Disable colorful text
//     charPreset: "0123456789", // Only numbers
//   });

//   req.session.captchaCode = captcha.text; // Store CAPTCHA text in the session
//   console.log("Captcha stored in session:", req.session.captchaCode);
//   res.type("svg").send(captcha.data);
// };

export const RegisterProvider = async (req, res) => {
  console.log("In provider register route");

  try {
    const { name, email, phone, password, city, clinic, yearsOfExperience, role } = req.body;
    let provider;

    // Ensure required fields are present
    if (!name || !email || !password || !phone || !city || !yearsOfExperience || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let foundClinic;
    if(role !== 'Pet Sitter'){
      foundClinic = await ClinicModel.findOne({ _id: clinic });
      if (!foundClinic) {
        return res.status(400).json({ success: false, message: "Clinic not found" });
      }
    }

    // Check if the provider already exists by email based on the role
    if (role === "Veterinarian") {
      provider = await VetModel.findOne({ email });
    } else if (role === "Pet Groomer") {
      provider = await GroomerModel.findOne({ email });
    } else if (role === "Pet Sitter") {
      provider = await SitterModel.findOne({ email });
    }

    if (provider) {
      return res.status(400).json({ success: false, message: `${role} already exists. Please login.` });
    }

    // Asynchronous password hashing
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;

    // Extract file buffers from Multer request
    const vetResumeBuffer = req.files['vetResume']?.[0]?.buffer;
    const vetLicenseBuffer = req.files['vetLicenseFile']?.[0]?.buffer;
    const vetDegreeBuffer = req.files['vetDegree']?.[0]?.buffer;
    const groomerCertificateBuffer = req.files['groomerCertificate']?.[0]?.buffer;
    const sitterCertificateBuffer = req.files['sitterCertificate']?.[0]?.buffer;

    // Ensure all required files are uploaded for specific roles
    if (role === "Veterinarian" && (!vetResumeBuffer || !vetLicenseBuffer || !vetDegreeBuffer || !clinic)) {
      return res.status(400).json({ success: false, message: "All required files (resume, license, degree) must be uploaded for Veterinarian" });
    }

    if (role === "Pet Groomer" && (!groomerCertificateBuffer || !clinic)) {
      return res.status(400).json({ success: false, message: "Grooming Certificate is required for Pet Groomer" });
    }

    if (role === "Pet Sitter" && !sitterCertificateBuffer) {
      return res.status(400).json({ success: false, message: "Sitter Certificate is required for Pet Sitter" });
    }

    // Create the provider registration document with the clinicId
    if (role === "Veterinarian") {
      provider = new VetModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        vetResume: vetResumeBuffer,
        vetLicenseFile: vetLicenseBuffer,
        vetDegree: vetDegreeBuffer,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
        clinicId: foundClinic._id,  
      });
    } else if (role === "Pet Groomer") {
      provider = new GroomerModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        groomerCertificate: groomerCertificateBuffer,
        groomingSpecialties: req.body.groomingSpecialties,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
        clinicId: foundClinic._id, 
      });
    } else if (role === "Pet Sitter") {
      provider = new SitterModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        sitterAddress: req.body.sitterAddress,
        sitterCertificate: sitterCertificateBuffer,
        sittingExperience: req.body.sittingExperience,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
      });
    }

    // Save the provider document to the database
    await provider.save();

    // Send verification email (asynchronous)
    setImmediate(async () => {
      try {
        await sendVerificationEmail(provider.email, verificationToken);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    });

    return res.status(200).json({
      success: true,
      message: `${role} registered successfully. Verification email sent.`,
      provider,
    });
  } catch (error) {
    console.error("Error in RegisterProvider:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const GetVetsAndGroomersByClinic = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;


    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    // Decode the token to get the clinicId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; // Assuming clinicId is part of the token payload

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Fetch all vets and groomers associated with the clinic and whose verificationStatus is 'pending'
    const vets = await VetModel.find({ clinic: clinicId, verificationStatus: 'pending' });
    const groomers = await GroomerModel.find({ clinic: clinicId, verificationStatus: 'pending' });

    // Check if there are no pending vets or groomers and return an empty response instead of an error
    if (vets.length === 0 && groomers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending vets or groomers found',
        vets: [],
        groomers: [],
      });
    }

    return res.status(200).json({
      success: true,
      vets,
      groomers,
    });
  } catch (error) {
    console.error('Error fetching vets and groomers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const GetProviderDetails = async (req, res) => {
  console.log("in get provider details");
  try {
    const { provider_id, role } = req.params;
    let provider = null;

  console.log("in get provider details the id and role is:", provider_id, "role:  ", role);


    if (role === "vet") {
      provider = await VetModel.findById(provider_id).lean();
    } else if (role === "groomer") {
      provider = await GroomerModel.findById(provider_id).lean();
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    return res.status(200).json({ provider });
  } catch (error) {
    console.error("Error fetching provider details:", error);
    return res.status(500).json({ error: "Internal server error" });
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

export const Profile = async (req, res) => {
  try {
    console.log("user in profile:", req.user);
    if (!req.user) {
      return res.status(200).json({
        success: false,
        message: "User not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: req.user, // Use the user set by the cookieJwtAuth middleware
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const Register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const ExistsUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (ExistsUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists. Please login." });
    }

    // Asynchronous password hashing
    const hashPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 15 * 60 * 1000;

    const user = new UserModel({
      email,
      password: hashPassword,
      name,
      phone,
      verificationToken: verificationToken,
      verificationTokenExpiresAt, // Correct expiration time in UTC+5
    });

    await user.save();

    setImmediate(async () => {
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully. Verification email sent.",
      user,
    });
  } catch (error) {
    console.error("Error in Register:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const CreatePetProfile = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    const { name, petType, breed, age, gender, size } = req.body;
    const photo = req.file; // Image buffer from multer middleware

    if (!photo) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Process image using sharp
    const optimizedImageBuffer = await sharp(photo.buffer)
      .resize({ width: 800, height: 800, fit: 'inside' })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    // Convert buffer to Base64 string
    const photoString = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

    const ExistsPet = await PetModel.findOne({ name: name.toLowerCase() });
    if (ExistsPet) {
      return res
        .status(400)
        .json({ success: false, message: "Pet with same name already exists." });
    }

    // Create a new pet profile with Base64 image string
    const newPet = new PetModel({
      userId: userID,
      name,
      petType,
      breed,
      age,
      gender,
      size,
      photo: photoString, // Store the Base64 string
    });

    const savedPet = await newPet.save();

    // Add pet to the user's list of pets
    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pets.push(savedPet._id);
    await user.save();

    return res.status(201).json({ message: 'Pet created successfully', pet: savedPet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating pet profile' });
  }
};

export const UpdatePetProfile = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;
    const petID = req.params.petId;

    // Find the pet and ensure it belongs to the user
    const pet = await PetModel.findOne({ _id: petID, userId: userID });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found or not authorized" });
    }

    const { name, petType, breed, age, gender, size } = req.body;
    let photoString = pet.photo; // Keep the existing photo by default

    // Check if a new photo is provided and process it
    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      photoString = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
    }

    // Check for duplicate name, excluding the current pet
    const ExistsPet = await PetModel.findOne({ name, userId: userID, _id: { $ne: petID } });
    if (ExistsPet) {
      return res
        .status(400)
        .json({ success: false, message: "Pet with the same name already exists." });
    }

    // Update the pet's fields
    pet.name = name || pet.name;
    pet.petType = petType || pet.petType;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.gender = gender || pet.gender;
    pet.size = size || pet.size;
    pet.photo = photoString; // Update the photo if changed

    const updatedPet = await pet.save();

    return res.status(201).json({ message: "Pet profile updated successfully", pet: updatedPet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating pet profile" });
  }
};

export const GetUserPets = async (req, res) => {
  try {
      const token = req.cookies.pet_ownerToken; 

      if (!token) {
          return res.status(401).json({
              message: 'No token provided, unauthorized',
              success: false,
          });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      const userId = decoded.id; 

      const pets = await PetModel.find({ userId: userId }) 
          .sort({ createdAt: -1 }) 
          .populate({
              path: 'userId', 
              select: 'username profilePicture',
          });

      const formattedPets = pets.map(pet => {
          return {
              ...pet.toObject(),
              photo: pet.photo 
          };
      });

      return res.status(200).json({
          pets: formattedPets,
          message: formattedPets.length === 0 
              ? 'No pets found' 
              : 'Pets fetched successfully.',
          success: true,
      });
  } catch (error) {
      return res.status(500).json({
          message: 'Error fetching pets',
          success: false,
      });
  }
};

export const DeletePetProfile = async (req, res) => {
  try {
    const token = req.cookies.pet_ownerToken; 

    if (!token) {
      return res.status(401).json({
        message: 'No token provided, unauthorized',
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const userId = decoded.id; 
    const { petId } = req.params;  

    const pet = await PetModel.findById(petId);
    if (!pet || pet.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized action, pet does not belong to this user',
        success: false
      });
    }

     // Step 1: Find and delete all memory books associated with the pet
    const memoryBooks = await MemoryBook.find({ petId: petId });
    if (memoryBooks.length > 0) {
      // Step 2: Delete all memories associated with those memory books
      await Memory.deleteMany({ bookId: { $in: memoryBooks.map(book => book._id) } });

      // Step 3: Delete all the memory books
      await MemoryBook.deleteMany({ petId: petId });
    }


    // Delete the pet profile
    await PetModel.findByIdAndDelete(petId);

    // Remove pet ID from the user's profile
    await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { pets: petId } },  
      { new: true }
    );

    return res.status(200).json({
      message: 'Pet profile deleted successfully',
      success: true
    });
  } catch (error) {
    console.log('Error deleting pet profile:', error);
    return res.status(500).json({
      message: 'Error deleting pet profile',
      success: false
    });
  }
};

export const RegisterClinic = async (req, res) => {
  console.log("in clinic register route");
  try {
    console.log("clinic request body:", req.body);
    const { clinicName, email, phone, password, city, address } = req.body;
    
    if (!clinicName || !email || !password || !phone || !city || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the clinic already exists by email
    const existingClinic = await ClinicModel.findOne({ email });
    if (existingClinic) {
      return res
        .status(400)
        .json({ success: false, message: 'Clinic already exists. Please login.' });
    }

    // Asynchronous password hashing
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;

    // Extract file buffers from Multer request (since you're using memory storage)
    const clinicRegistrationFileBuffer = req.files['clinicRegistrationFile']?.[0]?.buffer;
    const NICFileBuffer = req.files['NICFile']?.[0]?.buffer;
    const vetLicenseFileBuffer = req.files['vetLicenseFile']?.[0]?.buffer;
    const proofOfAddressFileBuffer = req.files['proofOfAddressFile']?.[0]?.buffer;

    // Ensure all required files are uploaded
    if (!clinicRegistrationFileBuffer || !NICFileBuffer || !vetLicenseFileBuffer || !proofOfAddressFileBuffer) {
      return res.status(400).json({ success: false, message: 'All required files must be uploaded.' });
    }

    // Optional: You can upload these buffers to a file storage service (e.g., AWS S3, Cloudinary) if needed.
    // For example, if you're uploading to S3, you would get the file URL from the upload and store that in the database.

    // Create the clinic registration document
    const clinic = new ClinicModel({
      clinicName,
      email,
      phone,
      password: hashedPassword,
      city,
      address,
      verificationToken:  verificationToken,
      verificationTokenExpiresAt,
      clinicRegistrationFile: clinicRegistrationFileBuffer, // Store buffer or URL if uploaded externally
      NICFile: NICFileBuffer, // Store buffer or URL if uploaded externally
      vetLicenseFile: vetLicenseFileBuffer, // Store buffer or URL if uploaded externally
      proofOfAddressFile: proofOfAddressFileBuffer, // Store buffer or URL if uploaded externally
      verificationStatus: 'pending',
    });

    await clinic.save();

    setImmediate(async () => {
      try {
        await sendVerificationEmail(clinic.email, verificationToken);
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Clinic registered successfully. Verification email sent.',
      clinic,
    });
  } catch (error) {
    console.error('Error in RegisterClinic:', error);
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

export const GetClinicsByCity = async (req, res) => {
  console.log("in get clinic by city route");
  try {
    const { city } = req.params;
    console.log("city is:", city);

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const clinics = await ClinicModel.find({
      city: city,
      emailVerified: true,
      verificationStatus: 'verified',
    });

    if (clinics.length === 0) {
      return res.status(204).send();
    }

    return res.status(200).json({
      success: true,
      message: "Clinics fetched successfully",
      clinics,
    });
  } catch (error) {
    console.error("Error in getClinicsByCityHandler:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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

export const GetRegisteredStaffByClinic = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;
    console.log("in registered staff route the token is:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    // Decode the token to extract the clinic ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; // Assuming clinicId is part of the token payload

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Fetch all registered vets and groomers for the specific clinic with "verified" status
    const vets = await VetModel.find({ clinic: clinicId, verificationStatus: "verified" });
    const groomers = await GroomerModel.find({ clinic: clinicId, verificationStatus: "verified" });

    // If no verified vets or groomers found, return an empty response
    if (vets.length === 0 && groomers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No verified vets or groomers found for this clinic",
        vets: [],
        groomers: [],
      });
    }

    // Return the verified vets and groomers
    return res.status(200).json({
      success: true,
      vets,
      groomers,
    });
  } catch (error) {
    console.error("Error fetching registered staff:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

// Update Provider Verfication Status
export const UpdateProviderVerificationStatus = async (req, res) => {
  try {
    const { providerId, status, type } = req.body; 

    // Validate inputs
    if (!providerId || !['verified', 'rejected'].includes(status) || !['vet', 'groomer'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid data provided.' });
    }
    const providerModel = type === 'vet' ? VetModel : GroomerModel;

    const provider = await providerModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found.` });
    }

    provider.verificationStatus = status;
    await provider.save();

    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Verify Email Function
export const VerifyEmail = async (req, res) => {
  try {
    const { code, type, role } = req.body;
    console.log("In verify email the req body:", req.body);

    if (!code || !type || !role) {
      return res.status(400).json({ success: false, message: "Code, type, and role are required" });
    }

    const roleModelMap = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      Veterinarian: VetModel,
      "Pet Groomer": GroomerModel,
      "Pet Sitter": SitterModel,
    };

    // Get the model based on the role
    const Model = roleModelMap[role];

    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    let query = {};
    let updateFields = {};

    if (type === "email") {
      // Query for email verification
      query = {
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      };
      updateFields = {
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiresAt: undefined,
      };
    } else if (type === "reset") {
      // Query for password reset verification
      query = {
        resetPasswordToken: code,
        resetPasswordTokenExpiresAt: { $gt: Date.now() },
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'email' or 'reset'." });
    }

    // Find the entity based on the query
    const updatedEntity = await Model.findOne(query);

    if (!updatedEntity) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid or expired ${type === "email" ? "email verification" : "password reset"} code` });
    }

    // Apply the update fields if any
    if (Object.keys(updateFields).length > 0) {
      Object.assign(updatedEntity, updateFields);
    }

    // Save the updated entity
    await updatedEntity.save();

    return res.status(200).json({
      success: true,
      message: `${type === "email" ? "Email verified" : "Password reset code verified"} successfully`,
    });
  } catch (error) {
    console.error("Error in VerifyCode:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Forgot Password Function
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify your email." });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;

    // Get the current time in UTC
    const currentTimeUTC = Date.now();
    const timeOffsetInMilliseconds = 5 * 60 * 60 * 1000;
    user.resetPasswordTokenExpiresAt = currentTimeUTC + timeOffsetInMilliseconds + 15 * 60 * 1000;

    await user.save();

    // Send the reset token to the user's email asynchronously
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({ success: true, message: "Password reset token sent to your email." });
  } catch (error) {
    console.error("Error in ForgotPassword:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Password Function
export const ResetPassword = async (req, res) => {
  console.log("in reset pass route the body is:", req.body);
  try {
    const { token, newPassword } = req.body;
  console.log("in reset pass route..token:", token, "newpass:", newPassword);

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    console.log("Current time (UTC):", Date.now());
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });
    
    console.log("User found:", user);


    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = bcryptjs.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend Verification Code Function
export const ResendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verficationToken = verificationToken;
    user.verficationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours

    // Save updated user with new token
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification code resent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Error in ResendVerificationCode:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend Reset OTP Function
export const ResendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the reset token has expired or is already used
    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Reset token has expired. Please request a new one." });
    }

    // Regenerate reset OTP if expired or not set
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetOtp;
    user.resetPasswordTokenExpiresAt = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes

    // Save updated user with new reset OTP
    await user.save();

    // Send reset OTP to email
    await sendResetPasswordEmail(user.email, resetOtp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP resent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Error in ResendResetOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login Function
export const Login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    // Define model mappings
    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    // Check if role is valid
    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    // Find user based on role and email
    const user = await Model.findOne({ email });

    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check if email is verified for all users
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify your email." });
    }

    // Check verificationStatus for 'clinic' and other providers
    if (role !== 'pet_owner' && user.verificationStatus !== 'verified') {
      return res.status(401).json({ success: false, message: `Your ${role} account is not verified. You cannot login at the moment.` });
    }

    // Update last login for the user
    user.lastLogin = Date.now();
    await user.save();

    // Create JWT payload
    const payload = { id: user._id, email: user.email, role: role };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Define role-specific cookie name
    const cookieName = `${role}Token`; // Example: "userToken", "clinicToken", etc.

    // Clear cookies for other roles if they exist
    const otherRoles = ['pet_owner', 'clinic', 'vet', 'groomer', 'sitter'].filter(r => r !== role);
    otherRoles.forEach(r => {
      res.clearCookie(`${r}Token`);
    });

    // Set cookie with the new token
    res.cookie(cookieName, token, {
      httpOnly: true,
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const { role } = req.body;
    console.log("role:", role);

    // Define model mappings for token cookie names based on roles
    const tokenMappings = {
      admin: "adminToken",
      pet_owner: "pet_ownerToken",
      clinic: "clinicToken",
      vet: "vetToken",
      groomer: "groomerToken",
      sitter: "sitterToken",
    };

    // Check if the role is valid and has a corresponding cookie token
    const cookieName = tokenMappings[role];
    if (!cookieName) {
      return res.status(400).json({ message: `No token found for the specified role: ${role}` });
    }

    // Clear the appropriate cookie for the given role
    res.clearCookie(cookieName, {
      httpOnly: true,
      path: "/",
    });

    return res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged out successfully` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log out", error: error.message });
  }
};
