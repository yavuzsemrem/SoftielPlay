# Port 8081'i temizle ve Expo'yu başlat
Write-Host "Port 8081 kontrol ediliyor..." -ForegroundColor Yellow

$port = 8081
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "Port $port kullanılıyor. Process'ler kapatılıyor..." -ForegroundColor Red
    
    foreach ($pid in $pids) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  - Process $pid ($($process.ProcessName)) kapatılıyor..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Process zaten kapanmış olabilir
        }
    }
    
    Start-Sleep -Seconds 2
    Write-Host "Port temizlendi!" -ForegroundColor Green
} else {
    Write-Host "Port $port temiz." -ForegroundColor Green
}

Write-Host "`nExpo başlatılıyor...`n" -ForegroundColor Cyan
npx expo start --port 8081




