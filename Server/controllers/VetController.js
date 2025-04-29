import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { PetGroomerService } from "../models/GroomerService.js";
import { PetSitterService } from "../models/SitterService.js";
import { VeterinarianService } from "../models/VetService.js";
import { SitterModel } from "../models/Sitter.js";
import jwt from 'jsonwebtoken';

export const GetVerifiedVets = async (req, res) => {
  try {
    const vets = await VetModel
      .find({
        emailVerified: true,
        verificationStatus: 'verified',
        restricted: false
      })
      .populate('clinicId', 'clinicName address')     // only grab name & location
      .populate({
        path: 'services',
        select: 'serviceName price availability',
      });

    return res.json({ vets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching vets' });
  }
};

export const GetVetById = async (req, res) => {
  try {
    const { vetId } = req.params;

    // Find the vet and populate their services with availability
    const vet = await VetModel.findById(vetId)
      .select('-password -__v') // Exclude sensitive fields
      .populate({
        path: 'services',
        match: { isActive: true }, // Only active services
        select: 'services price availability duration',
        populate: {
          path: 'providerId',
          select: 'name specialization yearsOfExperience qualifications photoUrl'
        }
      });

    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    // Format the availability data for easier frontend consumption
    const formattedVet = {
      ...vet.toObject(),
      services: vet.services.map(service => ({
        ...service.toObject(),
        availability: service.availability.map(day => ({
          day: day.day,
          slots: day.slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        }))
      }))
    };

    return res.json({ vet: formattedVet });
  } catch (err) {
    console.error('Error fetching vet details:', err);
    return res.status(500).json({ 
      message: 'Error fetching vet details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};