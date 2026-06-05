import { DriverProfile } from './driverProfile.model.js';
import { User } from '../users/user.model.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/config.js';

// ─────────────────────────────────────────────
// Helper: Upload a single file buffer to Cloudinary
// Returns the secure URL or null if no file provided
// ─────────────────────────────────────────────
const uploadIfPresent = async (file, folder) => {
  if (!file) return null;
  const result = await cloudinaryService.uploadStream(file.buffer, folder, file.originalname);
  return result.url;
};

export const driverController = {

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC — Driver Self-Registration
  // POST /api/v1/drivers/register
  // Accepts multipart/form-data with text fields + document files
  // Creates User (isActive: false) + DriverProfile with Cloudinary URLs
  // ─────────────────────────────────────────────────────────────────────────
  register: asyncWrapper(async (req, res) => {
    if (!config.auth.allowDriverSelfRegister) {
      throw new AppError(
        'Driver self-registration is disabled. Please contact Admin to add your account.',
        403
      );
    }

    const {
      fullName,
      phone: phoneField,
      mobile: mobileField,
      alternateMobile, currentAddress, permanentAddress,
      aadhaarNumber, panNumber,
      licenseNumber, licenseExpiry,
      hasOwnVehicle, vehicleType, vehicleNumber,
      rcExpiry, insuranceExpiry, permitExpiry, pucExpiry
    } = req.body;

    // Accept both 'phone' (standard) and 'mobile' (frontend form field name)
    const phone = phoneField || mobileField;

    // 1. Validate required fields
    if (!phone || !fullName || !licenseNumber || !licenseExpiry) {
      throw new AppError('Name, phone, license number, and license expiry are required.', 400);
    }

    // 2. Check if phone already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError('This phone number is already registered. Please login instead.', 409);
    }

    // 3. Check if license already in use
    const existingLicense = await DriverProfile.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existingLicense) {
      throw new AppError('This license number is already registered in the system.', 409);
    }

    // 4. Upload all document images to Cloudinary in parallel
    const files = req.files || {};
    logger.info(`[Driver Registration]: Uploading documents for ${phone}...`);

    const [
      profilePhotoUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      panImageUrl,
      licenseFrontUrl,
      licenseBackUrl,
      rcUrl,
      insuranceUrl,
      permitUrl,
      pucUrl
    ] = await Promise.all([
      uploadIfPresent(files.profilePhoto?.[0],    'drivers/profile'),
      uploadIfPresent(files.aadhaarFront?.[0],    'drivers/aadhaar'),
      uploadIfPresent(files.aadhaarBack?.[0],     'drivers/aadhaar'),
      uploadIfPresent(files.panImage?.[0],        'drivers/pan'),
      uploadIfPresent(files.licenseFront?.[0],    'drivers/license'),
      uploadIfPresent(files.licenseBack?.[0],     'drivers/license'),
      uploadIfPresent(files.rcImage?.[0],         'drivers/vehicle'),
      uploadIfPresent(files.insuranceImage?.[0],  'drivers/vehicle'),
      uploadIfPresent(files.permitImage?.[0],     'drivers/vehicle'),
      uploadIfPresent(files.pucImage?.[0],        'drivers/vehicle'),
    ]);

    logger.info(`[Driver Registration]: All documents uploaded for ${phone}`);

    // 5. Create User account — INACTIVE until admin approves
    const user = await User.create({
      fullName: fullName.toUpperCase(),
      phone,
      role: 'DRIVER',
      isActive: false,
      phoneVerified: false,
      password: `DRV_${phone}_${Date.now()}` // Dummy password; driver logs in via OTP only
    });

    // 6. Create DriverProfile with all details + Cloudinary URLs
    const profile = await DriverProfile.create({
      userId: user._id,
      alternateMobile: alternateMobile || null,
      currentAddress: currentAddress || null,
      permanentAddress: permanentAddress || null,
      profilePhotoUrl,
      aadhaarNumber: aadhaarNumber || null,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      panNumber: panNumber || null,
      panImageUrl,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseExpiry: new Date(licenseExpiry),
      licenseFrontUrl,
      licenseBackUrl,
      hasOwnVehicle: hasOwnVehicle === 'true' || hasOwnVehicle === true,
      vehicleType: vehicleType || null,
      vehicleNumber: vehicleNumber ? vehicleNumber.toUpperCase() : null,
      rcUrl,
      rcExpiry: rcExpiry ? new Date(rcExpiry) : null,
      insuranceUrl,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      permitUrl,
      permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
      pucUrl,
      pucExpiry: pucExpiry ? new Date(pucExpiry) : null,
      registrationStatus: 'pending_verification'
    });

    logger.info(`[Driver Registration]: Driver ${user._id} registered successfully. Pending admin approval.`);

    new ApiResponse(201, {
      message: 'Registration successful. Pending admin approval.',
      driverProfileId: profile._id,
      userId: user._id,
      phone: user.phone,
      status: 'pending_verification'
    }, 'Driver registered successfully. Awaiting admin approval.').send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Get all registered drivers (paginated, with user info populated)
  // GET /api/v1/drivers/all
  // ─────────────────────────────────────────────────────────────────────────
  all: asyncWrapper(async (req, res) => {
    const { page = 1, limit = 100, status, search } = req.query;

    const userFilter = { role: 'DRIVER' };
    if (search) {
      const regex = new RegExp(search, 'i');
      userFilter.$or = [{ fullName: regex }, { phone: regex }];
    }

    const [driverUsers, profiles] = await Promise.all([
      User.find(userFilter).select('fullName phone isActive status createdAt').sort({ createdAt: -1 }).lean(),
      DriverProfile.find()
        .populate('userId', 'fullName phone isActive createdAt')
        .populate('vehicleId', 'vehicleNumber vehicleType')
        .lean(),
    ]);

    const profileByUserId = new Map(
      profiles.map((p) => [String(p.userId?._id || p.userId), p])
    );

    let merged = driverUsers.map((user) => {
      const profile = profileByUserId.get(String(user._id));
      if (profile) {
        const u = profile.userId || user;
        return {
          _id: profile._id,
          userId: u,
          fullName: u.fullName || user.fullName,
          phone: u.phone || user.phone,
          status: profile.registrationStatus,
          registrationStatus: profile.registrationStatus,
          vehicleNumber: profile.vehicleNumber || profile.vehicleId?.vehicleNumber,
          licenseNumber: profile.licenseNumber,
          isActive: u.isActive ?? user.isActive,
          createdAt: profile.createdAt || user.createdAt,
          source: 'profile',
        };
      }
      return {
        _id: user._id,
        userId: user,
        fullName: user.fullName,
        phone: user.phone,
        status: user.isActive ? 'active' : 'pending_verification',
        registrationStatus: user.isActive ? 'active' : 'pending_verification',
        isActive: user.isActive,
        createdAt: user.createdAt,
        source: 'access_control',
      };
    });

    if (status) {
      merged = merged.filter(
        (d) => d.registrationStatus === status || d.status === status
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * limitNum;
    const paginated = merged.slice(skip, skip + limitNum);

    new ApiResponse(200, paginated, 'Drivers fetched successfully', {
      total: merged.length,
      page: pageNum,
      totalPages: Math.ceil(merged.length / limitNum) || 1,
    }).send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Get active drivers for trip assignment dropdown
  // GET /api/v1/drivers/active
  // ─────────────────────────────────────────────────────────────────────────
  active: asyncWrapper(async (req, res) => {
    // Fetch all users with DRIVER role (including those created via Users & Roles admin panel)
    const driverUsers = await User.find({ role: 'DRIVER', isActive: true })
      .select('fullName phone')
      .sort({ createdAt: -1 })
      .lean();

    // Map them to the shape expected by the frontend (which expects populated DriverProfiles)
    const drivers = driverUsers.map(u => ({
      _id: u._id,
      userId: {
        _id: u._id,
        fullName: u.fullName,
        phone: u.phone
      }
    }));

    new ApiResponse(200, drivers, 'Active drivers fetched successfully').send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // DRIVER — Get own profile
  // GET /api/v1/drivers/my-profile
  // ─────────────────────────────────────────────────────────────────────────
  myProfile: asyncWrapper(async (req, res) => {
    const profile = await DriverProfile.findOne({ userId: req.user.id })
      .populate('userId', 'fullName phone isActive')
      .populate('vehicleId', 'vehicleNumber vehicleType');

    if (!profile) {
      throw new AppError('Driver profile not found for your account.', 404);
    }

    new ApiResponse(200, profile, 'Driver profile fetched successfully').send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Get single driver full detail
  // GET /api/v1/drivers/:id
  // ─────────────────────────────────────────────────────────────────────────
  getById: asyncWrapper(async (req, res) => {
    const profile = await DriverProfile.findById(req.params.id)
      .populate('userId', 'fullName phone isActive createdAt')
      .populate('vehicleId', 'vehicleNumber vehicleType');

    if (!profile) {
      throw new AppError('Driver profile not found.', 404);
    }

    new ApiResponse(200, profile, 'Driver profile fetched successfully').send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Approve driver registration
  // PATCH /api/v1/drivers/:id/approve
  // ─────────────────────────────────────────────────────────────────────────
  approve: asyncWrapper(async (req, res) => {
    const profile = await DriverProfile.findById(req.params.id);

    if (profile) {
      if (profile.registrationStatus === 'active') {
        throw new AppError('This driver is already approved and active.', 400);
      }

      await User.findByIdAndUpdate(profile.userId, { isActive: true, status: 'active' });

      profile.registrationStatus = 'active';
      profile.rejectionReason = null;
      profile.verifiedBy = req.user.phone || 'ADMIN';
      profile.verifiedAt = new Date();
      await profile.save();

      logger.info(`[Driver Approval]: Driver profile ${profile._id} approved by ${req.user.phone}`);

      return new ApiResponse(
        200,
        {
          driverProfileId: profile._id,
          registrationStatus: 'active',
          verifiedBy: profile.verifiedBy,
          verifiedAt: profile.verifiedAt,
        },
        'Driver approved and activated successfully.'
      ).send(res);
    }

    const user = await User.findOne({ _id: req.params.id, role: 'DRIVER' });
    if (!user) throw new AppError('Driver not found.', 404);

    if (user.isActive) {
      throw new AppError('This driver is already approved and active.', 400);
    }

    user.isActive = true;
    user.status = 'active';
    await user.save();

    logger.info(`[Driver Approval]: Driver user ${user._id} (${user.phone}) approved by ${req.user.phone}`);

    new ApiResponse(
      200,
      {
        userId: user._id,
        registrationStatus: 'active',
        verifiedBy: req.user.phone || 'ADMIN',
        verifiedAt: new Date(),
      },
      'Driver approved and activated successfully.'
    ).send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Reject driver registration
  // PATCH /api/v1/drivers/:id/reject
  // ─────────────────────────────────────────────────────────────────────────
  reject: asyncWrapper(async (req, res) => {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      throw new AppError('A rejection reason of at least 5 characters is required.', 400);
    }

    const profile = await DriverProfile.findById(req.params.id);
    if (!profile) throw new AppError('Driver profile not found.', 404);

    if (profile.registrationStatus === 'rejected') {
      throw new AppError('This driver is already rejected.', 400);
    }

    // Ensure user stays deactivated
    await User.findByIdAndUpdate(profile.userId, { isActive: false });

    profile.registrationStatus = 'rejected';
    profile.rejectionReason = reason.trim();
    await profile.save();

    logger.info(`[Driver Rejection]: Driver profile ${profile._id} rejected by ${req.user.phone}. Reason: ${reason}`);

    new ApiResponse(200, {
      driverProfileId: profile._id,
      registrationStatus: 'rejected',
      rejectionReason: profile.rejectionReason
    }, 'Driver registration rejected.').send(res);
  })
};
