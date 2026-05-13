import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../../modules/users/user.model.js';
import { Farmer } from '../../modules/farmers/farmer.model.js';
import { Buyer } from '../../modules/buyers/buyer.model.js';
import { Product } from '../../modules/products/product.model.js';
import { Vehicle } from '../../modules/vehicles/vehicle.model.js';
import { DriverProfile } from '../../modules/drivers/driverProfile.model.js';
import { logger } from '../logger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/golden_fisheries';

// Mock Password for all seeded users
const SEED_PASSWORD = 'password123';
vreact-dom_client.js?v=9b9431e6:14338 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
auth:1 Access to XMLHttpRequest at 'http://127.0.0.1:5000/api/v1/auth/otp/send' from origin 'http://localhost:5174' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
authService.js:16  POST http://127.0.0.1:5000/api/v1/auth/otp/send net::ERR_FAILED
dispatchXhrRequest @ axios.js?v=9b9431e6:2072
xhr @ axios.js?v=9b9431e6:1982
dispatchRequest @ axios.js?v=9b9431e6:2459
Promise.then
_request @ axios.js?v=9b9431e6:2662
request @ axios.js?v=9b9431e6:2579
httpMethod @ axios.js?v=9b9431e6:2713
wrap @ axios.js?v=9b9431e6:12
(anonymous) @ authService.js:16
(anonymous) @ AdminAuth.jsx:67
executeDispatch @ react-dom_client.js?v=9b9431e6:9141
runWithFiberInDEV @ react-dom_client.js?v=9b9431e6:851
processDispatchQueue @ react-dom_client.js?v=9b9431e6:9167
(anonymous) @ react-dom_client.js?v=9b9431e6:9454
batchedUpdates$1 @ react-dom_client.js?v=9b9431e6:2044
dispatchEventForPluginEventSystem @ react-dom_client.js?v=9b9431e6:9240
dispatchEvent @ react-dom_client.js?v=9b9431e6:11319
dispatchDiscreteEvent @ react-dom_client.js?v=9b9431e6:11301

const seedDatabase = async () => {
  logger.info('[Seeding Run]: Initializing Golden Fisheries ERP mock registry...');

  try {
    // 1. Establish connection
    await mongoose.connect(MONGO_URI);
    logger.info('[Seeding Run]: Database connected successfully.');

    // 2. Wipe existing structures to prevent duplicates
    await Promise.all([
      User.deleteMany({}),
      Farmer.deleteMany({}),
      Buyer.deleteMany({}),
      Product.deleteMany({}),
      Vehicle.deleteMany({}),
      DriverProfile.deleteMany({})
    ]);
    logger.info('[Seeding Run]: Previous collections purged successfully.');

    // 3. Seed Users (Admin, Accountant, Drivers)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, salt);

    const users = await User.insertMany([
      {
        fullName: 'SYSTEM ADMINISTRATOR',
        phone: '9999911111',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      },
      {
        fullName: 'SENIOR ACCOUNTANT',
        phone: '9999922222',
        password: hashedPassword,
        role: 'ACCOUNTANT',
        isActive: true
      },
      {
        fullName: 'LOGISTICS DISPATCHER',
        phone: '9999933333',
        password: hashedPassword,
        role: 'MANAGER',
        isActive: true
      },
      {
        fullName: 'RAMESH KUMAR (DRIVER)',
        phone: '9876543210',
        password: hashedPassword,
        role: 'DRIVER',
        isActive: true
      },
      {
        fullName: 'SURESH SINGH (DRIVER)',
        phone: '9876543211',
        password: hashedPassword,
        role: 'DRIVER',
        isActive: true
      }
    ]);
    logger.info(`[Seeding Run]: Seeded ${users.length} system users.`);

    // 4. Seed Farmers (Sequentially to allow automatic increment without validation race conditions)
    const farmersData = [
      {
        fullName: 'ANDHRA AQUA FARMS LTD',
        phone: '9123456789',
        location: 'Nellore, Andhra Pradesh',
        pondCount: 12,
        isActive: true
      },
      {
        fullName: 'KRISHNA DELTA FISHERIES',
        phone: '9123456780',
        location: 'Vijayawada, Andhra Pradesh',
        pondCount: 8,
        isActive: true
      },
      {
        fullName: 'GODAVARI BLACK TIGER BREEDERS',
        phone: '9123456781',
        location: 'Kakinada, Andhra Pradesh',
        pondCount: 15,
        isActive: true
      }
    ];
    const farmers = [];
    for (const f of farmersData) {
      const farmer = new Farmer(f);
      await farmer.save();
      farmers.push(farmer);
    }
    logger.info(`[Seeding Run]: Seeded ${farmers.length} partner aquaculture farmers.`);

    // 5. Seed Buyers (Sequentially and using correct schema enums: EXTERNAL/INTERNAL)
    const buyersData = [
      {
        buyerName: 'HYDERABAD SEAFOOD WHOLESALERS',
        phone: '8123456780',
        deliveryAddress: 'Begum Bazaar, Hyderabad',
        buyerType: 'EXTERNAL',
        isActive: true
      },
      {
        buyerName: 'GOLDEN FISHERIES RETAIL OUTLET (FISHMALL)',
        phone: '8123456781',
        deliveryAddress: 'Main Mall Branch, Gachibowli',
        buyerType: 'INTERNAL',
        isActive: true
      },
      {
        buyerName: 'GOLDEN GRACE FINE DINE RESTAURANT',
        phone: '8123456782',
        deliveryAddress: 'Golden Grace Hotel Suite, Hyderabad',
        buyerType: 'INTERNAL',
        isActive: true
      }
    ];
    const buyers = [];
    for (const b of buyersData) {
      const buyer = new Buyer(b);
      await buyer.save();
      buyers.push(buyer);
    }
    logger.info(`[Seeding Run]: Seeded ${buyers.length} distribution buyers.`);

    // 6. Seed Products
    const products = await Product.insertMany([
      {
        name: 'ROHU CARP',
        category: 'FRESHWATER',
        scientificName: 'Labeo rohita',
        baseUnit: 'KG',
        basePrice: 180,
        quantity: 1200, // Pre-load 1.2 Tons of Rohu stock
        minStockLimit: 200,
        isActive: true
      },
      {
        name: 'VANNAMEI WHITE SHRIMPS',
        category: 'PRAWNS',
        scientificName: 'Litopenaeus vannamei',
        baseUnit: 'KG',
        basePrice: 480,
        quantity: 650,
        minStockLimit: 100,
        isActive: true
      },
      {
        name: 'BLACK TIGER PRAWNS',
        category: 'PRAWNS',
        scientificName: 'Penaeus monodon',
        baseUnit: 'KG',
        basePrice: 650,
        quantity: 450,
        minStockLimit: 50,
        isActive: true
      },
      {
        name: 'RESTAURANT CRAB PORTIONS',
        category: 'CRAB',
        scientificName: 'Scylla serrata',
        baseUnit: 'KG',
        basePrice: 350,
        quantity: 300,
        minStockLimit: 30,
        isActive: true
      }
    ]);
    logger.info(`[Seeding Run]: Seeded ${products.length} catalog items.`);

    // 7. Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        vehicleNumber: 'AP-16-TJ-1234',
        vehicleType: 'Mini Truck',
        payloadCapacity: 1500,
        ownVehicle: true,
        status: 'AVAILABLE'
      },
      {
        vehicleNumber: 'AP-39-UL-5678',
        vehicleType: 'Pickup',
        payloadCapacity: 2500,
        ownVehicle: true,
        status: 'AVAILABLE'
      }
    ]);
    logger.info(`[Seeding Run]: Seeded ${vehicles.length} logistics reefer vehicles.`);

    // 8. Bind Driver Profiles
    const driver1 = users.find(u => u.fullName.includes('RAMESH'));
    const driver2 = users.find(u => u.fullName.includes('SURESH'));

    const drivers = await DriverProfile.insertMany([
      {
        userId: driver1._id,
        licenseNumber: 'DL-39AP1234567',
        licenseExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
        vehicleId: vehicles[0]._id,
        registrationStatus: 'active'
      },
      {
        userId: driver2._id,
        licenseNumber: 'DL-16AP9876543',
        licenseExpiry: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
        vehicleId: vehicles[1]._id,
        registrationStatus: 'active'
      }
    ]);
    logger.info(`[Seeding Run]: Binded ${drivers.length} Driver Profiles with reefer trucks.`);

    logger.info('[Seeding Run]: DATABASE SEED COMPLETE. All mock systems ready to run.');
    await mongoose.connection.close();
  } catch (error) {
    logger.error(`[Seeding Error]: Execution aborted. ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
export default seedDatabase;
