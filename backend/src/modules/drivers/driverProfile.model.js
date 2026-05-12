import mongoose from 'mongoose';

const driverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'Driver license expiry is required']
    },
    hasOwnVehicle: {
      type: Boolean,
      default: false
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true
    },
    registrationStatus: {
      type: String,
      enum: ['pending_verification', 'active', 'rejected'],
      default: 'pending_verification',
      index: true
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);
export default DriverProfile;
