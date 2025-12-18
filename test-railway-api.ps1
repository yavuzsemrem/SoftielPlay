# Railway API Test Script
# Railway URL'nizi aşağıdaki değişkene girin

$RAILWAY_URL = "softielplay-server-production.up.railway.app"

Write-Host "🚀 Railway API Test Başlatılıyor..." -ForegroundColor Green
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ Health Check Test Ediliyor..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://$RAILWAY_URL/health" -UseBasicParsing
    Write-Host "✅ Health Check Başarılı!" -ForegroundColor Green
    Write-Host "   Status Code: $($healthResponse.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Health Check Başarısız!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 2. Arama Testi
Write-Host "2️⃣ Arama Endpoint Test Ediliyor (q=test)..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "https://$RAILWAY_URL/api/search?q=test" -UseBasicParsing
    Write-Host "✅ Arama Başarılı!" -ForegroundColor Green
    Write-Host "   Status Code: $($searchResponse.StatusCode)" -ForegroundColor Cyan
    
    # JSON'u parse et
    $searchData = $searchResponse.Content | ConvertFrom-Json
    Write-Host "   Query: $($searchData.query)" -ForegroundColor Cyan
    Write-Host "   Count: $($searchData.count)" -ForegroundColor Cyan
    Write-Host "   Results: $($searchData.results.Count) sonuç bulundu" -ForegroundColor Cyan
    
    if ($searchData.results.Count -gt 0) {
        Write-Host "   İlk Sonuç:" -ForegroundColor Cyan
        Write-Host "     - Title: $($searchData.results[0].title)" -ForegroundColor White
        Write-Host "     - Artist: $($searchData.results[0].artist)" -ForegroundColor White
        Write-Host "     - Video ID: $($searchData.results[0].videoId)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Arama Başarısız!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# 3. Türkçe Arama Testi
Write-Host "3️⃣ Türkçe Arama Test Ediliyor (q=türkçe şarkı)..." -ForegroundColor Yellow
try {
    $encodedQuery = [System.Web.HttpUtility]::UrlEncode("türkçe şarkı")
    $turkishResponse = Invoke-WebRequest -Uri "https://$RAILWAY_URL/api/search?q=$encodedQuery" -UseBasicParsing
    Write-Host "✅ Türkçe Arama Başarılı!" -ForegroundColor Green
    $turkishData = $turkishResponse.Content | ConvertFrom-Json
    Write-Host "   Count: $($turkishData.count) sonuç bulundu" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Türkçe Arama Başarısız!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✨ Test Tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Frontend için Environment Variable:" -ForegroundColor Yellow
Write-Host "   EXPO_PUBLIC_API_URL=https://$RAILWAY_URL" -ForegroundColor Cyan






