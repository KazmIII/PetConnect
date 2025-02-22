import mongoose from "mongoose";

const PetGroomerServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Groomer', required: true },
  serviceName: { type: String, required: true },
  customService: { type: String, default: null },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number },
  isPackage: { type: Boolean, default: false },
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
          endTime: { type: String, required: true },
        }
      ],
    }
  ],
});

export const PetGroomerService = mongoose.model('GroomerService', PetGroomerServiceSchema);
