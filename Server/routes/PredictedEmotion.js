import express from 'express'; 
import {PetModel} from '../models/Pet.js'; // Ensure the extension is included for ES modules

const router = express.Router(); // Pet model (MongoDB schema)

// Route: Store predicted emotion for a pet
router.post("/store-prediction", async (req, res) => {
  const { petId, emotion, confidence } = req.body;

  if (!petId || !emotion || !confidence) {
    return res.status(400).json({ success: false, message: "Missing data fields." });
  }

  try {
    // Find the pet by ID
    const pet = await PetModel.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found." });
    }

    // Store the emotion prediction
    pet.emotions.push({
      emotion,
      confidence, // Array of probabilities
      timestamp: new Date(),
    });

    await pet.save();

    return res.status(200).json({ success: true, message: "Prediction stored successfully." });
  } catch (error) {
    console.error("Error storing prediction:", error);
    return res.status(500).json({ success: false, message: "Server error. Could not store prediction." });
  }
});

// Route: Get all emotions for a pet by name
router.get("/emotions/:petName", async (req, res) => {
    const { petName } = req.params;
  
    try {
      // Find the pet by name and select the emotions field
      const pet = await PetModel.findOne({ name: petName }).select('emotions');
      if (!pet) {
        return res.status(404).json({ success: false, message: "Pet not found." });
      }
  
      // Return the emotions associated with the pet
      return res.status(200).json({ success: true, emotions: pet.emotions });
    } catch (error) {
      console.error("Error fetching emotions:", error);
      return res.status(500).json({ success: false, message: "Server error. Could not fetch emotions." });
    }
  });
  
  

export default router;
