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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const providerId = decoded.id;

    // Extract service data from the request body
    const { 
      services,        // Now expecting an array of services
      customService, 
      description, 
      price, 
      duration, 
      isPackage, 
      maxPets, 
      availability, 
      deliveryMethods   // New field
    } = req.body;

    // Validate required fields
    if (!services || !Array.isArray(services) || services.length === 0 || !price) {
      return res.status(400).json({ message: 'At least one service and price are required' });
    }

    // Check provider existence
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

    // Define the new service data
    const serviceData = {
      providerId,
      services,           // Now an array
      customService,
      description,
      price,
      duration,
      deliveryMethods,    // Now added
      isActive: true,
      availability,
    };

    // Role-specific fields
    if (userRole === 'groomer') {
      serviceData.isPackage = isPackage || false;
    } else if (userRole === 'sitter') {
      serviceData.maxPets = maxPets || 1;
    }

    // Create and save the new service
    const newService = new ServiceModel(serviceData);
    const savedService = await newService.save();

    // Add the service ID to the provider's profile (if provider has a services array)
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
  const { userRole } = req.query;
  const { serviceId } = req.params;

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

  const ServiceModel = serviceModelMappings[userRole];
  const UserModel = userModelMappings[userRole];

  if (!ServiceModel || !UserModel) {
    return res.status(400).json({ success: false, message: "Invalid role provided" });
  }

  try {
    const deletedService = await ServiceModel.findByIdAndDelete(serviceId);

    if (!deletedService) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Remove the serviceId from the provider (user)'s services array
    await UserModel.updateOne(
      { services: serviceId },
      { $pull: { services: serviceId } }
    );

    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const UpdateService = async (req, res) => {
  const { userRole } = req.query;
  const { serviceId } = req.params;
  
  const { 
    services,            
    customService, 
    description, 
    price, 
    duration, 
    isPackage, 
    maxPets, 
    availability, 
    deliveryMethods     
  } = req.body;

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

  const ServiceModel = serviceModelMappings[userRole];
  const UserModel = userModelMappings[userRole];

  if (!ServiceModel || !UserModel) {
    return res.status(400).json({ success: false, message: "Invalid role provided" });
  }

  if (!serviceId || !services || !Array.isArray(services) || services.length === 0 || !price) {
    return res.status(400).json({ success: false, message: "Service ID, at least one service, and price are required" });
  }

  try {
    const service = await ServiceModel.findById(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Update fields
    service.services = services;
    service.customService = customService;
    service.description = description;
    service.price = price;
    service.duration = duration;
    service.availability = availability;
    service.deliveryMethods = deliveryMethods;

    // Role-specific fields
    if (userRole === 'groomer') {
      service.isPackage = isPackage || false;
    } else if (userRole === 'sitter') {
      service.maxPets = maxPets || 1;
    }

    const updatedService = await service.save();

    return res.status(200).json({ success: true, message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};