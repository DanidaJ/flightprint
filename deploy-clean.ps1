# deploy-clean.ps1 - Simplified FlightPrint Deployment
# Build locally, upload images, deploy to single folder

# Variables
$server = "root@168.231.73.185"
$projectPath = "C:\Users\Danida Jayakody\-01- WORK\FlightPrint"
$version = Get-Date -Format "yyyyMMdd-HHmm"
$imageTarFile = "flightprint-images.tar"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   FlightPrint Deployment (Clean)   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file first." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Success: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Navigate to project directory
Set-Location $projectPath

# Build Docker images locally
Write-Host ""
Write-Host "Building Docker images locally (version: $version)..." -ForegroundColor Yellow
docker compose build --build-arg VERSION=$version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Success: Docker images built" -ForegroundColor Green

# Save Docker images to tar file
Write-Host ""
Write-Host "Saving Docker images to tar file..." -ForegroundColor Yellow
docker save -o $imageTarFile flightprint-client flightprint-server
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to save images!" -ForegroundColor Red
    exit 1
}
Write-Host "Success: Images saved to $imageTarFile" -ForegroundColor Green

# Upload images and deployment files to VPS
Write-Host ""
Write-Host "Uploading to VPS..." -ForegroundColor Yellow
scp $imageTarFile "${server}:/tmp/"
scp docker-compose.yml "${server}:/tmp/"
scp .env "${server}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Upload failed!" -ForegroundColor Red
    Remove-Item $imageTarFile -Force
    exit 1
}
Write-Host "Success: Upload complete" -ForegroundColor Green

# Deploy on VPS
Write-Host ""
Write-Host "Deploying on VPS..." -ForegroundColor Yellow

$tempScript = [System.IO.Path]::GetTempFileName()
$scriptContent = @'
#!/bin/bash
set -e

echo 'Loading Docker images...'
docker load -i /tmp/flightprint-images.tar

echo 'Setting up deployment directory...'
mkdir -p /root/flightprint
cd /root/flightprint

echo 'Updating deployment files...'
mv /tmp/docker-compose.yml .
mv /tmp/.env .

echo 'Stopping and removing old containers...'
docker compose down --remove-orphans 2>/dev/null || true

echo 'Removing old stopped containers (cleanup)...'
docker container prune -f

echo 'Starting new containers...'
docker compose up -d

echo 'Waiting for containers to be ready...'
sleep 5

echo 'Restarting Nginx to refresh DNS resolution...'
cd /root/nginx && docker compose restart && cd /root/flightprint
echo 'Nginx restarted successfully'

echo 'Cleaning up tar file...'
rm /tmp/flightprint-images.tar

echo ''
echo '===== Container Status ====='
docker compose ps

echo ''
echo '===== Health Checks ====='
echo 'Backend health:'
curl -I http://localhost:5000 2>/dev/null && echo 'Backend OK' || echo 'Backend not responding'
echo ''
echo 'Frontend health:'
curl -I http://localhost:3000 2>/dev/null && echo 'Frontend OK' || echo 'Frontend not responding'

echo ''
echo '===== Public URL Test ====='
curl -I https://flightprint.danidajay.com 2>&1 | head -5 || echo 'Public URL test failed'

echo ''
echo 'Deployment complete!'
'@

$scriptContent -replace "`r`n", "`n" | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline

scp $tempScript "${server}:/tmp/deploy.sh"
ssh $server "chmod +x /tmp/deploy.sh && bash /tmp/deploy.sh && rm /tmp/deploy.sh"

Remove-Item $tempScript -Force

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Deployment failed!" -ForegroundColor Red
    Remove-Item $imageTarFile -Force
    exit 1
}

# Clean up local files
Write-Host ""
Write-Host "Cleaning up local files..." -ForegroundColor Yellow
Remove-Item $imageTarFile -Force

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Deployment Complete!             " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now live at:" -ForegroundColor Cyan
Write-Host "   https://flightprint.danidajay.com" -ForegroundColor White
Write-Host ""
Write-Host "Internal container access (via VPS):" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "   ssh $server 'cd /root/flightprint && docker compose logs -f'" -ForegroundColor White
Write-Host ""
Write-Host "Check status:" -ForegroundColor Cyan
Write-Host "   ssh $server 'docker ps | grep flightprint'" -ForegroundColor White
Write-Host ""
