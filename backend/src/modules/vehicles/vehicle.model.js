import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Mini Truck', 'Pickup', 'Tempo', 'Big Truck'],
      default: 'Mini Truck'
    },
    ownVehicle: {
      type: Boolean,
      required: true,
      default: true
    },
    rcNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    rcExpiry: {
      type: Date
    },
    insuranceNumber: {
      type: String,
      trim: true
    },
    insuranceExpiry: {
      type: Date
    },
    status: {
      type: String,
      required: true,
      enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
