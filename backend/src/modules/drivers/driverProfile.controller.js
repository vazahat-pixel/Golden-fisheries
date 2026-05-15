import { DriverProfile } from './driverProfile.model.js';
import { User } from '../users/user.model.js';
import { cloudinaryService } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { logger } from '../../utils/logger.js';

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
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};

    if (status) filter.registrationStatus = status;

    // If search provided, find matching users first
    if (search) {
      const regex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        $or: [{ fullName: regex }, { phone: regex }]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      filter.$or = [
        { userId: { $in: userIds } },
        { licenseNumber: regex },
        { vehicleNumber: regex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [docs, total] = await Promise.all([
      DriverProfile.find(filter)
        .populate('userId', 'fullName phone isActive createdAt')
        .populate('vehicleId', 'vehicleNumber vehicleType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DriverProfile.countDocuments(filter)
    ]);

    new ApiResponse(200, docs, 'Drivers fetched successfully', {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    }).send(res);
  }),


  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Get active drivers for trip assignment dropdown
  // GET /api/v1/drivers/active
  // ─────────────────────────────────────────────────────────────────────────
  active: asyncWrapper(async (req, res) => {
    const drivers = await DriverProfile.find({ registrationStatus: 'active' })
      .populate('userId', 'fullName phone')
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .sort({ createdAt: -1 });

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
    if (!profile) throw new AppError('Driver profile not found.', 404);

    if (profile.registrationStatus === 'active') {
      throw new AppError('This driver is already approved and active.', 400);
    }

    // Activate the User account so driver can OTP-login
    await User.findByIdAndUpdate(profile.userId, { isActive: true });

    // Update profile status
    profile.registrationStatus = 'active';
    profile.rejectionReason = null;
    profile.verifiedBy = req.user.phone || 'ADMIN';
    profile.verifiedAt = new Date();
    await profile.save();

    logger.info(`[Driver Approval]: Driver profile ${profile._id} approved by ${req.user.phone}`);

    new ApiResponse(200, {
      driverProfileId: profile._id,
      registrationStatus: 'active',
      verifiedBy: profile.verifiedBy,
      verifiedAt: profile.verifiedAt
    }, 'Driver approved and activated successfully.').send(res);
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
