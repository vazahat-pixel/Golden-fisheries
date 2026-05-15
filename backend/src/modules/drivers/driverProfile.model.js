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

    // ── Personal Details ─────────────────────────────────────
    alternateMobile: { type: String, trim: true, default: null },
    currentAddress:  { type: String, trim: true, default: null },
    permanentAddress:{ type: String, trim: true, default: null },
    profilePhotoUrl: { type: String, default: null },

    // ── Identity Documents ───────────────────────────────────
    aadhaarNumber:   { type: String, trim: true, default: null },
    aadhaarFrontUrl: { type: String, default: null },
    aadhaarBackUrl:  { type: String, default: null },

    panNumber:  { type: String, trim: true, uppercase: true, default: null },
    panImageUrl:{ type: String, default: null },

    // ── Driving License ──────────────────────────────────────
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    licenseExpiry:   { type: Date, required: [true, 'License expiry is required'] },
    licenseFrontUrl: { type: String, default: null },
    licenseBackUrl:  { type: String, default: null },

    // ── Vehicle Information ──────────────────────────────────
    hasOwnVehicle: { type: Boolean, default: false },
    vehicleType:   { type: String, enum: ['Mini Truck', 'Pickup', 'Tempo', 'Big Truck'], default: null },
    vehicleNumber: { type: String, trim: true, uppercase: true, default: null },

    rcUrl:            { type: String, default: null },
    rcExpiry:         { type: Date, default: null },
    insuranceUrl:     { type: String, default: null },
    insuranceExpiry:  { type: Date, default: null },
    permitUrl:        { type: String, default: null },
    permitExpiry:     { type: Date, default: null },
    pucUrl:           { type: String, default: null },
    pucExpiry:        { type: Date, default: null },

    // ── Registration Lifecycle ───────────────────────────────
    registrationStatus: {
      type: String,
      enum: ['pending_verification', 'active', 'rejected'],
      default: 'pending_verification',
      index: true
    },
    rejectionReason: { type: String, default: null },
    verifiedBy:      { type: String, default: null },
    verifiedAt:      { type: Date, default: null },

    // ── Assignment ───────────────────────────────────────────
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

export const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);
export default DriverProfile;
