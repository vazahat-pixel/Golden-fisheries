import { Harvest } from '../modules/harvests/harvest.model.js';
import { Tapal } from '../modules/tapals/tapal.model.js';
import { Trip } from '../modules/trips/trip.model.js';
import { BuyerVerification } from '../modules/buyer-portal/buyerVerification.model.js';
import { BuyerBill } from '../modules/buyer-portal/buyerBill.model.js';
import { AppError } from '../utils/appError.js';

/** Harvest states that mean "farmer / procurement approval done" for downstream logistics */
const HARVEST_APPROVED_LIKE = new Set(['CONFIRMED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_TAPAL', 'COMPLETED']);

/**
 * Service-level guards for procurement → logistics → billing order.
 */
export const flowGuard = {
  async assertHarvestReadyForTapalConversion(harvestId) {
    const harvest = await Harvest.findById(harvestId);
    if (!harvest) throw new AppError('Harvest not found', 404);

    const convertible = new Set(['CONFIRMED', 'PARTIALLY_CONVERTED']);
    if (!convertible.has(harvest.status)) {
      throw new AppError(
        `Tapal cannot be created. Harvest status is "${harvest.status}". It must be CONFIRMED (farmer-approved) or PARTIALLY_CONVERTED for further dispatch.`,
        400
      );
    }
  },

  async assertHarvestEligibleForProcurementBilling(harvestId) {
    if (!harvestId) return;
    const harvest = await Harvest.findById(harvestId);
    if (!harvest) throw new AppError('Linked harvest not found', 404);
    if (!HARVEST_APPROVED_LIKE.has(harvest.status)) {
      throw new AppError(
        `Procurement billing blocked: harvest status is "${harvest.status}". Farmer confirmation (CONFIRMED) is required first.`,
        400
      );
    }
  },

  async assertTripReadyForTripStart(tripId, driverId) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (!trip.driverId || trip.driverId.toString() !== driverId.toString()) {
      throw new AppError('Access denied: you are not the assigned driver for this trip.', 403);
    }

    if (!['ASSIGNED', 'ACCEPTED'].includes(trip.status)) {
      throw new AppError(`Trip cannot start. Trip status is "${trip.status}".`, 409);
    }
  },

  async assertTapalReadyForTripStart(tapalId, driverId) {
    const tapal = await Tapal.findById(tapalId);
    if (!tapal) throw new AppError('Tapal not found', 404);

    const startableTapal = ['DRIVER_ASSIGNED', 'DRIVER_ACCEPTED'];
    if (!startableTapal.includes(tapal.status)) {
      throw new AppError(
        `Trip cannot start. Tapal status is "${tapal.status}". Assign a driver first.`,
        400
      );
    }

    if (tapal.driverId && tapal.driverId.toString() !== driverId.toString()) {
      throw new AppError('Access denied: you are not the assigned driver for this Tapal.', 403);
    }

    const trip = await Trip.findOne({ tapalId: tapal._id });
    if (!trip) throw new AppError('Trip record not found for this Tapal.', 404);

    if (!['ASSIGNED', 'ACCEPTED'].includes(trip.status)) {
      throw new AppError(`Trip cannot start. Trip status is "${trip.status}".`, 409);
    }
  },

  async assertBuyerCanVerify(tapalId) {
    const tapal = await Tapal.findById(tapalId);
    if (!tapal) throw new AppError('Tapal not found', 404);
    if (!['IN_TRANSIT', 'DELIVERED', 'BILL_PENDING'].includes(tapal.status)) {
      throw new AppError(
        `Cannot verify. Tapal status is "${tapal.status}". Must be IN_TRANSIT, DELIVERED, or BILL_PENDING.`,
        400
      );
    }
  },

  async assertBuyerCanBill(tapalId) {
    const verification = await BuyerVerification.findOne({ tapal: tapalId });
    if (!verification) {
      throw new AppError('No buyer verification found for this Tapal.', 400);
    }
    if (!['APPROVED', 'APPROVED_WITH_DISCREPANCY'].includes(verification.verificationStatus)) {
      throw new AppError(
        `Cannot bill. Verification status is "${verification.verificationStatus}".`,
        400
      );
    }
    const existingBill = await BuyerBill.findOne({ tapal: tapalId, isDeleted: { $ne: true } });
    if (existingBill) {
      throw new AppError(`Buyer bill already exists: ${existingBill.billNo}`, 409);
    }
  },

  async assertSalesReturnAllowed(buyerBillId) {
    const bill = await BuyerBill.findById(buyerBillId);
    if (!bill) throw new AppError('Buyer Bill not found', 404);
    if (bill.status === 'CANCELLED') {
      throw new AppError('Cannot return against a cancelled bill.', 400);
    }
  }
};

export default flowGuard;
