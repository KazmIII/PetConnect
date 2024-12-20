import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { PetGroomerService } from "../models/GroomerService.js";
import { PetSitterService } from "../models/SitterService.js";
import { VeterinarianService } from "../models/VetService.js";
import { SitterModel } from "../models/Sitter.js";
import jwt from 'jsonwebtoken';

export const AddService = async (req, res) => {
    const { userRole } = req.query; // Get the user role from query parameters
    const serviceModelMappings = {
      vet: VeterinarianService,
      groomer: PetGroomerService,
      sitter: PetSitterService,
    };
  
    const ServiceModel = serviceModelMappings[userRole];
  
    if (!ServiceModel) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }
  
    const token = req.cookies[`${userRole}Token`];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
  
    try {
      // Decode token to get the providerId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const providerId = decoded.id;
  
      // Extract service data from the request body
      const { serviceName, customService, description, price, duration, isPackage, maxPets, availability } = req.body;
  
      // Validate the required fields
      if (!serviceName || !price) {
        return res.status(400).json({ message: 'Service name and price are required' });
      }
  
      // Dynamically check if the provider exists based on the role
      let provider;
      if (userRole === 'vet') {
        provider = await VetModel.findById(providerId);
      } else if (userRole === 'groomer') {
        provider = await GroomerModel.findById(providerId);
      } else if (userRole === 'sitter') {
        provider = await SitterModel.findById(providerId);
      }
  
      if (!provider) {
        return res.status(404).json({ message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} not found` });
      }
  
      // Define the service fields based on the role
      const serviceData = {
        providerId,
        serviceName,
        customService,
        description,
        price,
        duration,
        isActive: true, // Default value for isActive
        availability,
      };
  
      // Add role-specific fields
      if (userRole === 'groomer') {
        serviceData.isPackage = isPackage; // Only for groomer service
      } else if (userRole === 'sitter') {
        serviceData.maxPets = maxPets || 1; // Only for sitter service, default to 1 if not provided
      }
  
      // Create a new service based on the provided role
      const newService = new ServiceModel(serviceData);
  
      const savedService = await newService.save();
  
      // Add the service ID to the provider's profile (if the provider has a services array)
      provider.services = provider.services || [];
      provider.services.push(savedService._id);
      await provider.save();
  
      return res.status(201).json({ message: 'Service created successfully', service: savedService });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating service' });
    }
};
  
export const GetServicesByProvider = async (req, res) => {
    try {
      const { userRole } = req.query;
  
      const serviceModelMappings = {
        vet: VeterinarianService,          
        groomer: PetGroomerService,  
        sitter: PetSitterService,    
      };
  
      const ServiceModel = serviceModelMappings[userRole];
      if (!ServiceModel) {
        return res.status(400).json({ success: false, message: "Invalid role provided" });
      }
  
      const token = req.cookies[`${userRole}Token`]; 
  
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }
  
      // Decode the token to get providerId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const providerId = decoded.id;
  
      // Fetch services for the specific provider (vet, groomer, or sitter)
      const services = await ServiceModel.find({ providerId })
        .populate('providerId', 'name') // Optionally populate provider info (e.g., name)
        .exec();
  
      if (!services || services.length === 0) {
        return res.status(404).json({ message: `No services found for this ${userRole}` });
      }
  
      // Return the services related to the provider
      return res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ message: 'Error fetching services' });
    }
};
  

export const GetServiceDetails = async (req, res) => {
    const { userRole } = req.query; // The userRole comes from the query parameters (e.g., ?userRole=groomer)
    const { serviceId } = req.params; // The serviceId comes from the URL parameters
    
    // Define the model mappings for each user role's service model
    const serviceModelMappings = {
      vet: VeterinarianService,
      groomer: PetGroomerService,
      sitter: PetSitterService,
    };
  
    // Select the appropriate service model based on userRole
    const ServiceModel = serviceModelMappings[userRole];
    if (!ServiceModel) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }
  
    try {
      // Fetch the service details by serviceId from the selected service model
      const service = await ServiceModel.findOne({ _id: serviceId });
  
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
  
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      console.error("Error fetching service details:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const DeleteService = async (req, res) => {
    const { userRole } = req.query; // The userRole comes from the query parameters
    const { serviceId } = req.params; // The serviceId comes from the URL parameters
  
    // Define the model mappings for each user role's service and user models
    const serviceModelMappings = {
      vet: VeterinarianService,
      groomer: PetGroomerService,
      sitter: PetSitterService,
    };
  
    const userModelMappings = {
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };
  
    // Select the appropriate service and user models based on userRole
    const ServiceModel = serviceModelMappings[userRole];
    const UserModel = userModelMappings[userRole];
  
    if (!ServiceModel || !UserModel) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }
  
    try {
      // Attempt to delete the service with the given serviceId from the selected service model
      const deletedService = await ServiceModel.findByIdAndDelete(serviceId);
  
      if (!deletedService) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
  
      // Remove the serviceId from the associated user's account
      await UserModel.updateOne(
        { services: serviceId }, // Match the user who has this serviceId
        { $pull: { services: serviceId } } // Remove the serviceId from their services array
      );
  
      return res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};
  
export const UpdateService = async (req, res) => {
    const { userRole } = req.query; // The userRole comes from the query parameters
    const { serviceId } = req.params; // The serviceId comes from the URL parameters
    const { serviceName, customService, description, price, duration, isPackage, availability } = req.body; // The updated service data
  
    // Define the model mappings for each user role's service and user models
    const serviceModelMappings = {
      vet: VeterinarianService,
      groomer: PetGroomerService,
      sitter: PetSitterService,
    };
  
    const userModelMappings = {
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };
  
    // Select the appropriate service and user models based on userRole
    const ServiceModel = serviceModelMappings[userRole];
    const UserModel = userModelMappings[userRole];
  
    if (!ServiceModel || !UserModel) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }
  
    if (!serviceId || !serviceName || !price) {
      return res.status(400).json({ success: false, message: "Service ID, service name, and price are required" });
    }
  
    try {
      // Attempt to find the service with the given serviceId from the selected service model
      const service = await ServiceModel.findById(serviceId);
  
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
  
      // Update the service with the new data
      service.serviceName = serviceName;
      service.customService = customService;
      service.description = description;
      service.price = price;
      service.duration = duration;
      service.isPackage = isPackage;
      service.availability = availability;
  
      // Save the updated service
      const updatedService = await service.save();
  
      // Optionally, update the user's service data if needed (e.g., in their profile)
      // This step may not be necessary if the service data in the user model is consistent with the service model
  
      return res.status(200).json({ success: true, message: "Service updated successfully", service: updatedService });
    } catch (error) {
      console.error("Error updating service:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
};