import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    farmerCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
      uppercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      uppercase: true
    },
    village: {
      type: String,
      trim: true,
      uppercase: true
    },
    hasWhatsapp: {
      type: Boolean,
      default: true
    },
    pondCount: {
      type: Number,
      default: 1,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate farmer sequential code before validation
farmerSchema.pre('validate', async function (next) {
  if (this.farmerCode) return next();
  try {
    const lastFarmer = await this.constructor.findOne({ farmerCode: { $regex: /^FRM-\d+$/i } }, 'farmerCode')
      .sort({ farmerCode: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });
      
    let nextId = 1;
    if (lastFarmer && lastFarmer.farmerCode) {
      const match = lastFarmer.farmerCode.match(/FRM-(\d+)/i);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.farmerCode = `FRM-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Farmer = mongoose.model('Farmer', farmerSchema);
export default Farmer;
