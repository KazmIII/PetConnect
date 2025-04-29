import mongoose from "mongoose";

const PetSitterServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sitter', required: true },
  services: [{ type: String, required: true }],
  customService: { type: String, default: null }, 
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number },
  maxPets: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  availability: [
    {
      day: {
        type: String,
        enum: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        required: true,
      },
      slots: [
        {
          startTime: { type: String, required: true },
          endTime:   { type: String, required: true },
        }
      ],
    }
  ],
  deliveryMethods: [{ type: String }]
});

export const PetSitterService = mongoose.model('SitterService', PetSitterServiceSchema);