require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateSystemDependencies } = require('./src/utils/checkSystem');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basit health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
const searchRoutes = require('./src/features/search/routes/searchRoutes');
app.use('/api', searchRoutes);

// Sunucuyu başlat
async function startServer() {
  // Sistem bağımlılıklarını kontrol et (SKIP_SYSTEM_CHECK env var ile atlanabilir)
  const skipCheck = process.env.SKIP_SYSTEM_CHECK === 'true';
  const dependenciesOk = await validateSystemDependencies(skipCheck);
  
  if (!dependenciesOk) {
    console.error('\n❌ Sunucu başlatılamadı: Eksik sistem bağımlılıkları nedeniyle.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Sunucu ${PORT} portunda çalışıyor\n`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} zaten kullanımda!`);
      console.error(`Lütfen port ${PORT} kullanan uygulamayı kapatın veya farklı bir port kullanın.`);
      console.error(`\nPort kullanan process'i bulmak için:`);
      console.error(`  netstat -ano | findstr :${PORT}`);
      console.error(`\nVeya server/.env dosyasında farklı bir PORT belirleyin.\n`);
      process.exit(1);
    } else {
      console.error('Sunucu hatası:', error);
      process.exit(1);
    }
  });
}

startServer().catch((error) => {
  console.error('Sunucu başlatılırken hata oluştu:', error);
  process.exit(1);
});
