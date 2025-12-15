# Port 8081'i temizle ve Expo'yu başlat
Write-Host "Port 8081 temizleniyor..."

$port = 8081
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "Process $pid kapatılıyor..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "Port temizlendi!"
} else {
    Write-Host "Port zaten temiz"
}

Write-Host "`nExpo başlatılıyor...`n"
npm start




