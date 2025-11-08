# deploy.ps1 - FlightPrint Deployment Script
# PowerShell deployment script for FlightPrint application

# Variables
$server = "root@168.231.73.185"
$projectPath = "C:\Users\Danida Jayakody\-01- WORK\FlightPrint"
$remotePath = "/root/flightprint"
$tarFile = "flightprint-deploy.tar"
$version = Get-Date -Format "yyyyMMdd-HHmm"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   FlightPrint Deployment Script    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists, if not prompt for environment variables
if (-not (Test-Path ".env")) {
    Write-Host "Environment Configuration" -ForegroundColor Yellow
    Write-Host "No .env file found. Let's set up your environment variables." -ForegroundColor Yellow
    Write-Host ""
    
    # Prompt for MongoDB URI
    Write-Host "MongoDB Atlas URI:" -ForegroundColor Cyan
    Write-Host "   Example: mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Flight" -ForegroundColor Gray
    $mongoUri = Read-Host "   Enter MongoDB URI"
    
    # Prompt for API Keys
    Write-Host ""
    Write-Host "API Keys:" -ForegroundColor Cyan
    $amadeusClientId = Read-Host "   Amadeus Client ID"
    $amadeusClientSecret = Read-Host "   Amadeus Client Secret"
    $aerodataboxKey = Read-Host "   AeroDataBox API Key"
    
    # Prompt for URLs
    Write-Host ""
    Write-Host "Configuration URLs:" -ForegroundColor Cyan
    $defaultClientUrl = "http://168.231.73.185:3000"
    $clientUrl = Read-Host "   Client URL (default: $defaultClientUrl)"
    if ([string]::IsNullOrWhiteSpace($clientUrl)) {
        $clientUrl = $defaultClientUrl
    }
    
    $defaultApiUrl = "http://168.231.73.185:5000/api"
    $apiUrl = Read-Host "   API URL (default: $defaultApiUrl)"
    if ([string]::IsNullOrWhiteSpace($apiUrl)) {
        $apiUrl = $defaultApiUrl
    }
    
    # Create .env file
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=$mongoUri

# Amadeus API Configuration
AMADEUS_CLIENT_ID=$amadeusClientId
AMADEUS_CLIENT_SECRET=$amadeusClientSecret
AMADEUS_API_BASE_URL=https://test.api.amadeus.com

# AeroDataBox API Configuration
AERODATABOX_API_KEY=$aerodataboxKey
AERODATABOX_API_HOST=aerodatabox.p.rapidapi.com

# CORS Configuration
CLIENT_URL=$clientUrl

# Frontend API URL
VITE_API_URL=$apiUrl
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Success: .env file created" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Success: Found existing .env file" -ForegroundColor Green
    Write-Host ""
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
Write-Host ""
Write-Host "Navigating to project directory..." -ForegroundColor Yellow
Set-Location $projectPath

# Clean up old tar file if exists
if (Test-Path $tarFile) {
    Write-Host "Removing old deployment archive..." -ForegroundColor Yellow
    Remove-Item $tarFile -Force
}

# Build Docker images locally with version tag
Write-Host ""
Write-Host "Building Docker images (version: $version)..." -ForegroundColor Yellow
docker compose build --build-arg VERSION=$version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Success: Docker images built successfully" -ForegroundColor Green

# Create deployment archive
Write-Host ""
Write-Host "Creating deployment archive..." -ForegroundColor Yellow
# Note: client/.env and server/.env are already included in their respective folders
tar -cvf $tarFile --exclude=client/node_modules --exclude=server/node_modules --exclude=node_modules --exclude=.git client server docker-compose.yml .env
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create tar archive!" -ForegroundColor Red
    exit 1
}
Write-Host "Success: Archive created - $tarFile" -ForegroundColor Green

# Upload to VPS
Write-Host ""
Write-Host "Uploading to VPS ($server)..." -ForegroundColor Yellow
scp $tarFile "${server}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Upload failed! Check SSH connection." -ForegroundColor Red
    exit 1
}
Write-Host "Success: Upload complete" -ForegroundColor Green

# Deploy on VPS
Write-Host ""
Write-Host "Deploying on VPS..." -ForegroundColor Yellow

# Create a temporary script file with LF line endings
$tempScript = [System.IO.Path]::GetTempFileName()
$scriptContent = @'
cd /root
echo 'Creating backup of existing deployment...'
if [ -d flightprint ]; then
    backup_name=flightprint_$(date +%F_%H-%M-%S)
    mv flightprint $backup_name
    echo "Backup created: $backup_name"
fi
mkdir -p flightprint
echo 'Extracting files...'
tar -xf flightprint-deploy.tar -C flightprint
cd flightprint
echo 'Stopping existing containers...'
docker compose down
echo 'Starting new containers...'
docker compose up -d --build
echo 'Containers started'
echo ''
echo 'Container status:'
docker compose ps
echo ''
echo 'Running health checks...'
sleep 5
echo 'Backend health:'
curl -I http://localhost:5000 2>/dev/null && echo 'Backend OK' || echo 'Backend not responding'
echo ''
echo 'Frontend health:'
curl -I http://localhost:3000 2>/dev/null && echo 'Frontend OK' || echo 'Frontend not responding'
'@

# Write with Unix line endings
$scriptContent -replace "`r`n", "`n" | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline

# Upload and execute the script
scp $tempScript "${server}:/root/deploy_script.sh"
ssh $server "chmod +x /root/deploy_script.sh && bash /root/deploy_script.sh && rm /root/deploy_script.sh"

# Clean up temp file
Remove-Item $tempScript -Force

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Deployment failed!" -ForegroundColor Red
    exit 1
}

# Clean up local tar file
Write-Host ""
Write-Host "Cleaning up local files..." -ForegroundColor Yellow
Remove-Item $tarFile -Force

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Deployment Complete!             " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application should be running at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://168.231.73.185:3000" -ForegroundColor White
Write-Host "   Backend:  http://168.231.73.185:5000" -ForegroundColor White
Write-Host ""
Write-Host "To view logs, run:" -ForegroundColor Cyan
Write-Host "   ssh $server 'cd /root/flightprint && docker compose logs -f'" -ForegroundColor White
Write-Host ""
