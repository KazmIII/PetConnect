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