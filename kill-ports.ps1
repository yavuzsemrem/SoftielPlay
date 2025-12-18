# Port'ları temizleme scripti

Write-Host "Port 3000 ve 8081'i kontrol ediliyor..." -ForegroundColor Yellow

# Port 3000'i kullanan process'leri bul ve kapat
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "Port 3000 kullanımda, process'ler kapatılıyor..." -ForegroundColor Red
    $port3000 | ForEach-Object {
        $pid = $_.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Process $pid kapatıldı" -ForegroundColor Green
    }
} else {
    Write-Host "Port 3000 boş" -ForegroundColor Green
}

# Port 8081'i kullanan process'leri bul ve kapat
$port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($port8081) {
    Write-Host "Port 8081 kullanımda, process'ler kapatılıyor..." -ForegroundColor Red
    $port8081 | ForEach-Object {
        $pid = $_.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Process $pid kapatıldı" -ForegroundColor Green
    }
} else {
    Write-Host "Port 8081 boş" -ForegroundColor Green
}

# Node process'lerini kapat
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Node process'leri kapatılıyor..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  Tüm Node process'leri kapatıldı" -ForegroundColor Green
}

Write-Host "`nTemizlik tamamlandı! Artık 'npm run dev:all' komutunu çalıştırabilirsiniz." -ForegroundColor Cyan

