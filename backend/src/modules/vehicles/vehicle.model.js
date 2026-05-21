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
    type: {
      type: String,
      required: true
    },
    capacity: {
      type: String
    },
    fuelType: {
      type: String,
      default: 'Diesel'
    },
    gpsId: {
      type: String,
      trim: true
    },
    assignedDriverId: {
      type: String
    },
    assignedDriverName: {
      type: String
    },
    documents: {
      rc: { status: String, expiry: Date, url: String },
      insurance: { status: String, expiry: Date, url: String },
      permit: { status: String, expiry: Date, url: String },
      fitness: { status: String, expiry: Date, url: String },
      pollution: { status: String, expiry: Date, url: String }
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE'],
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
