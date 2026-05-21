import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLE_LIST } from '../../constants/roles.js';
import { BUSINESS_UNIT_LIST } from '../../constants/businessUnits.js';
import { applyRoleDefaults } from '../../constants/rbacDefaults.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Avoid returning password hashes in standard queries by default
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ROLE_LIST,
        message: '{VALUE} is not a valid ERP user role'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'revoked'],
      default: 'active'
    },
    permissions: {
      panels: {
        restaurant: { type: Boolean, default: false },
        fishmall: { type: Boolean, default: false },
        driver: { type: Boolean, default: false },
        admin: { type: Boolean, default: false }
      },
      modules: {
        type: Map,
        of: new mongoose.Schema({
          read: { type: Boolean, default: false },
          write: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }, { _id: false }),
        default: {}
      }
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    platformAccess: {
      web: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
      mobileViewOnly: { type: Boolean, default: false }
    },
    businessUnit: {
      type: String,
      enum: BUSINESS_UNIT_LIST,
      default: 'MKE'
    },
    refreshToken: {
      type: String,
      select: false
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshToken;
        delete ret.otp;
        return ret;
      }
    }
  }
);

userSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('role')) {
    applyRoleDefaults(this);
  }
  next();
});

// Hash password automatically before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12); // Production-grade work factor
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password attempts safely using constant-time comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
