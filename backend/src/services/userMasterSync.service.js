import { User } from '../modules/users/user.model.js';
import { Buyer } from '../modules/buyers/buyer.model.js';
import { ROLES, normalizeRole } from '../constants/roles.js';
import { normalizePhone10 } from '../utils/phone.js';
import { logger } from '../utils/logger.js';

const DEFAULT_BUYER_ADDRESS = 'ADDRESS PENDING — UPDATE IN BUYER MASTER';

/**
 * Ensure an active BUYER user has a matching Buyer master record (for tapal dropdown).
 */
export async function ensureBuyerMasterForUser(user) {
  if (!user?.phone) return null;

  const role = normalizeRole(user.role);
  if (role !== ROLES.BUYER) return null;
  if (user.isActive === false) return null;

  const phone = normalizePhone10(user.phone);
  if (phone.length !== 10) return null;

  const existing = await Buyer.findOne({
    isActive: { $ne: false },
    $or: [{ phone }, { phone: user.phone }],
  });

  if (existing) {
    return existing;
  }

  try {
    const buyer = await Buyer.create({
      buyerName: (user.fullName || 'BUYER').trim().toUpperCase(),
      phone,
      buyerType: 'EXTERNAL',
      deliveryAddress: DEFAULT_BUYER_ADDRESS,
    });
    logger.info(`[UserMasterSync]: Created buyer master for user ${phone}`);
    return buyer;
  } catch (err) {
    if (err.code === 11000) {
      return Buyer.findOne({ $or: [{ phone }, { phone: user.phone }] });
    }
    throw err;
  }
}

/**
 * Sync all active BUYER users → Buyer master collection.
 */
export async function syncAllBuyerUsersToMaster() {
  const users = await User.find({
    role: ROLES.BUYER,
    isActive: { $ne: false },
  }).lean();

  let created = 0;
  for (const u of users) {
    const phone = normalizePhone10(u.phone);
    const had = await Buyer.exists({ $or: [{ phone }, { phone: u.phone }] });
    const buyer = await ensureBuyerMasterForUser(u);
    if (buyer && !had) created += 1;
  }

  return { buyerUsers: users.length, buyersCreated: created };
}

/**
 * After user create/update — sync master data for role.
 */
export async function syncUserMasterRecords(user) {
  if (!user) return { buyer: null };

  const role = normalizeRole(user.role);
  let buyer = null;

  if (role === ROLES.BUYER) {
    buyer = await ensureBuyerMasterForUser(user);
  }

  return { buyer };
}
