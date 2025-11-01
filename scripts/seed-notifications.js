/**
 * Seed Script for Notifications & Activities Testing
 * 
 * This script creates sample notifications, activities, alerts, and settings
 * in Firestore for testing the notifications feature.
 * 
 * Usage: node scripts/seed-notifications.js <uid>
 * Example: node scripts/seed-notifications.js abc123xyz
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

// Get UID from command line arguments
const uid = process.argv[2];

if (!uid) {
  console.error('❌ Error: Please provide a user UID as argument');
  console.log('Usage: node scripts/seed-notifications.js <uid>');
  process.exit(1);
}

async function seedNotifications() {
  try {
    console.log(`🌱 Seeding notifications for user: ${uid}`);
    
    const storeRef = db.collection('stores').doc(uid);
    
    // Check if store exists
    const storeDoc = await storeRef.get();
    if (!storeDoc.exists) {
      console.error('❌ Store not found. Please create a store first.');
      process.exit(1);
    }

    // Sample Notifications
    const notifications = [
      {
        type: 'order_created',
        title: 'Pesanan Baru Diterima',
        message: 'Kamu mendapatkan pesanan baru dari pembeli.',
        status: 'unread',
        priority: 'high',
        icon: '🛒',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
        read_at: null,
      },
      {
        type: 'product_review',
        title: 'Ulasan Baru untuk Produkmu',
        message: 'Pembeli memberikan ulasan bintang 5 untuk produk Sarden Pedas 350g.',
        status: 'unread',
        priority: 'medium',
        icon: '⭐',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)), // 5 hours ago
        read_at: null,
      },
      {
        type: 'promotion_approved',
        title: 'Promosi Telah Disetujui',
        message: 'Promosi Diskon Awal Bulan telah disetujui oleh admin.',
        status: 'read',
        priority: 'low',
        icon: '🎉',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
        read_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 23 * 60 * 60 * 1000)),
      },
      {
        type: 'shipment_delivered',
        title: 'Pesanan Telah Diterima Pembeli',
        message: 'Pesanan berhasil dikonfirmasi diterima oleh pembeli.',
        status: 'read',
        priority: 'medium',
        icon: '📦',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 48 * 60 * 60 * 1000)), // 2 days ago
        read_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 47 * 60 * 60 * 1000)),
      },
      {
        type: 'stock_alert',
        title: 'Stok Produk Menipis',
        message: 'Beberapa produk Anda memiliki stok yang menipis. Segera lakukan restok.',
        status: 'unread',
        priority: 'high',
        icon: '⚠️',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)), // 1 hour ago
        read_at: null,
      },
    ];

    // Add notifications
    console.log('📬 Adding notifications...');
    const notifRef = storeRef.collection('notifications');
    for (const notif of notifications) {
      await notifRef.add(notif);
    }
    console.log(`✅ Added ${notifications.length} notifications`);

    // Sample Activities
    const activities = [
      {
        type: 'create_product',
        description: 'Menambahkan produk baru "Tuna Kaleng Original 200g"',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Jakarta, Indonesia',
      },
      {
        type: 'update_order_status',
        description: 'Mengubah status pesanan menjadi "Dikirim"',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Jakarta, Indonesia',
      },
      {
        type: 'reply_review',
        description: 'Membalas ulasan pembeli untuk produk "Sarden Pedas 350g"',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Jakarta, Indonesia',
      },
      {
        type: 'login',
        description: 'Seller berhasil login ke dashboard',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Jakarta, Indonesia',
      },
      {
        type: 'update_product',
        description: 'Mengupdate harga produk "Sarden Kaleng Pedas 350g"',
        timestamp: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)),
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Jakarta, Indonesia',
      },
    ];

    // Add activities
    console.log('📊 Adding activities...');
    const activityRef = storeRef.collection('activities');
    for (const activity of activities) {
      await activityRef.add(activity);
    }
    console.log(`✅ Added ${activities.length} activities`);

    // Sample System Alerts
    const alerts = [
      {
        level: 'warning',
        title: 'Stok Menipis',
        message: 'Produk "Sarden Pedas 350g" hanya tersisa 5 stok. Pertimbangkan untuk restok.',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
      },
      {
        level: 'info',
        title: 'Pembaruan Sistem',
        message: 'Aplikasi seller akan diperbarui pada 2 November 2025 pukul 02:00 WIB.',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
      {
        level: 'success',
        title: 'Peningkatan Performa',
        message: 'Toko kamu mendapatkan rating rata-rata 4.9 minggu ini. Pertahankan!',
        created_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)),
      },
    ];

    // Add system alerts
    console.log('🚨 Adding system alerts...');
    const alertRef = storeRef.collection('system_alerts');
    for (const alert of alerts) {
      await alertRef.add(alert);
    }
    console.log(`✅ Added ${alerts.length} system alerts`);

    // Notification Settings
    const settings = {
      email_notifications: true,
      push_notifications: true,
      in_app_notifications: true,
      preferences: {
        order_updates: true,
        product_reviews: true,
        system_alerts: true,
        promotions: false,
      },
      last_updated: admin.firestore.Timestamp.now(),
    };

    // Add notification settings
    console.log('⚙️ Adding notification settings...');
    await storeRef.collection('settings').doc('notifications').set(settings);
    console.log('✅ Added notification settings');

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`\n📝 Summary:`);
    console.log(`   - ${notifications.length} notifications`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${alerts.length} system alerts`);
    console.log(`   - 1 notification settings document`);
    console.log(`\n🌐 Visit: http://localhost:3001/seller/notifications`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedNotifications();
