import mongoose from 'mongoose';
import { firebaseService } from '../src/services/firebase.service.js';
import { User } from '../src/modules/users/user.model.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function run() {
  const tokenArg = process.argv[2];
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vazahat:golden123@cluster0.spf2aye.mongodb.net/golden-fisheries-v2?retryWrites=true&w=majority';
  
  console.log('Connecting to Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to Database successfully.');

  let targetTokens = [];
  if (tokenArg) {
    targetTokens = [tokenArg];
    console.log(`Using CLI argument token: ${tokenArg}`);
  } else {
    // Lookup users with device tokens
    const users = await User.find({ deviceTokens: { $exists: true, $not: { $size: 0 } } }).select('fullName phone deviceTokens');
    if (users.length === 0) {
      console.log('No registered device tokens found in the database User collection.');
      console.log('Please register a device token first by logging in to the web client, or pass a token as a command line argument.');
      await mongoose.disconnect();
      process.exit(0);
    }
    console.log(`Found ${users.length} user(s) with registered device tokens:`);
    users.forEach(u => {
      console.log(` - User: ${u.fullName} (${u.phone}) has ${u.deviceTokens.length} token(s)`);
    });
    targetTokens = users.flatMap(u => u.deviceTokens);
  }

  console.log(`Sending test push to ${targetTokens.length} token(s)...`);
  const result = await firebaseService.sendMulticast(targetTokens, {
    title: 'Golden Fisheries Test Push 🚀',
    body: 'Hello! This is a test push notification sent from the backend script.',
    data: {
      type: 'ALERT',
      message: 'FCM push notifications are successfully configured!'
    }
  });

  console.log('FCM Multicast Result:', result);

  if (result.failedTokens && result.failedTokens.length > 0) {
    console.log(`Cleaning up ${result.failedTokens.length} invalid/failed tokens from DB...`);
    await User.updateMany(
      { deviceTokens: { $in: result.failedTokens } },
      { $pull: { deviceTokens: { $in: result.failedTokens } } }
    );
    console.log('Cleaned up failed tokens successfully.');
  }

  await mongoose.disconnect();
  console.log('Disconnected from Database.');
}

run().catch(async (err) => {
  console.error('Error running test script:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
