/**
 * List all stores in Firestore
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function listStores() {
  try {
    console.log('📋 Listing all stores...\n');
    
    const storesSnapshot = await db.collection('stores').limit(10).get();
    
    if (storesSnapshot.empty) {
      console.log('❌ No stores found in Firestore.');
      console.log('Please create a seller account first or use Firebase Auth UID.');
      process.exit(0);
    }

    console.log(`Found ${storesSnapshot.size} stores:\n`);
    
    storesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Store ID: ${doc.id}`);
      console.log(`   Name: ${data.store_name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log('');
    });

    console.log('💡 To seed notifications for a store, run:');
    console.log('   node scripts/seed-notifications.js <STORE_ID>');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing stores:', error);
    process.exit(1);
  }
}

listStores();
