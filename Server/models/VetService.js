import mongoose from "mongoose";

const VetServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet', required: true }, 
  serviceName: { type: String, required: true },
  customService: { type: String, default: null },
  description: { type: String }, 
  price: { type: Number, required: true }, 
  duration: { type: Number }, 
  isActive: { type: Boolean, default: true },
  availability: [
    {
      day: {
        type: String,
        enum: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ], // Days of the week
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

export const VeterinarianService = mongoose.model('VetService', VetServiceSchema);
