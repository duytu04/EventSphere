# EventSphere Monorepo Azure Deployment Script
# Deploy Frontend to Azure Static Web Apps (from /frontend)
# Deploy Backend to Azure App Service (from /backend)
# Monorepo structure with selective deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentName = "dev",
    
    [Parameter(Mandatory=$true)]
    [string]$AppNamePrefix = "eventsphere",
    
    [Parameter(Mandatory=$true)]
    [string]$RepositoryUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName = "main",
    
    [Parameter(Mandatory=$true)]
    [string]$MySqlAdminPassword,
    
    [Parameter(Mandatory=$true)]
    [string]$JwtSecret,
    
    [string]$MailHost = "smtp.gmail.com",
    [int]$MailPort = 587,
    [string]$MailUsername = "",
    [string]$MailPassword = "",
    
    [switch]$DeployFrontend = $true,
    [switch]$DeployBackend = $true,
    [switch]$DeployInfrastructure = $true
)

Write-Host "🚀 EventSphere Monorepo Azure Deployment Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Variables
$AppName = "$AppNamePrefix-$EnvironmentName"
$BackendAppName = "$AppName-backend"
$FrontendAppName = "$AppName-frontend"
$MySqlServerName = "$AppName-mysql"
$AcrName = "$AppNamePrefix$EnvironmentName" + "acr"

Write-Host "📋 Monorepo Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host "  Environment: $EnvironmentName" -ForegroundColor White
Write-Host "  Repository: $RepositoryUrl" -ForegroundColor White
Write-Host "  Branch: $BranchName" -ForegroundColor White
Write-Host "  App Name: $AppName" -ForegroundColor White
Write-Host "  Backend: $BackendAppName" -ForegroundColor White
Write-Host "  Frontend: $FrontendAppName" -ForegroundColor White
Write-Host "  MySQL: $MySqlServerName" -ForegroundColor White
Write-Host "  ACR: $AcrName" -ForegroundColor White
Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Yellow
Write-Host "  Deploy Infrastructure: $DeployInfrastructure" -ForegroundColor White
Write-Host "  Deploy Backend: $DeployBackend" -ForegroundColor White
Write-Host "  Deploy Frontend: $DeployFrontend" -ForegroundColor White
Write-Host ""

# Check if Azure CLI is installed
Write-Host "📋 Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az version --output tsv --query '"azure-cli"'
    Write-Host "✅ Azure CLI version: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    Write-Host "Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
Write-Host "📋 Checking Azure login..." -ForegroundColor Yellow
try {
    $account = az account show --output tsv --query 'name' 2>$null
    if ($account) {
        Write-Host "✅ Logged in as: $account" -ForegroundColor Green
    } else {
        Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Create resource group
Write-Host "📋 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create resource group" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Resource group created" -ForegroundColor Green

# Deploy infrastructure using Bicep (if requested)
if ($DeployInfrastructure) {
    Write-Host "📋 Deploying infrastructure..." -ForegroundColor Yellow
    az deployment group create `
        --resource-group $ResourceGroupName `
        --template-file "azure-deploy.bicep" `
        --parameters `
            environmentName=$EnvironmentName `
            appNamePrefix=$AppNamePrefix `
            repositoryUrl=$RepositoryUrl `
            branchName=$BranchName `
            mysqlAdminPassword=$MySqlAdminPassword `
            jwtSecret=$JwtSecret `
            mailHost=$MailHost `
            mailPort=$MailPort `
            mailUsername=$MailUsername `
            mailPassword=$MailPassword

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to deploy infrastructure" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Infrastructure deployed" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping infrastructure deployment" -ForegroundColor Yellow
}

# Deploy Backend (if requested)
if ($DeployBackend) {
    Write-Host "📋 Building and deploying backend..." -ForegroundColor Yellow
    $acrLoginServer = "$AcrName.azurecr.io"

    # Create Azure Container Registry if not exists
    $acrExists = az acr show --name $AcrName --resource-group $ResourceGroupName --query "name" --output tsv 2>$null
    if (-not $acrExists) {
        Write-Host "📋 Creating Azure Container Registry..." -ForegroundColor Yellow
        az acr create --resource-group $ResourceGroupName --name $AcrName --sku Basic --admin-enabled true
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create Azure Container Registry" -ForegroundColor Red
            exit 1
        }
    }

    # Login to ACR
    az acr login --name $AcrName

    # Build and push image
    $imageName = "$acrLoginServer/eventsphere-backend:latest"
    Write-Host "📋 Building Docker image from ./backend..." -ForegroundColor Yellow
    docker build -t $imageName ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
        exit 1
    }

    Write-Host "📋 Pushing Docker image..." -ForegroundColor Yellow
    docker push $imageName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push Docker image" -ForegroundColor Red
        exit 1
    }

    # Configure App Service to use the Docker image
    Write-Host "📋 Configuring App Service..." -ForegroundColor Yellow
    az webapp config container set `
        --resource-group $ResourceGroupName `
        --name $BackendAppName `
        --docker-custom-image-name $imageName

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to configure App Service" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend deployed successfully" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping backend deployment" -ForegroundColor Yellow
}

# Deploy Frontend (if requested)
if ($DeployFrontend) {
    Write-Host "📋 Deploying frontend..." -ForegroundColor Yellow
    
    # Build frontend
    Write-Host "📋 Building frontend..." -ForegroundColor Yellow
    Set-Location ./frontend
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build frontend" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
    
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    Write-Host "ℹ️  Frontend will be deployed via GitHub Actions or Azure Static Web Apps CLI" -ForegroundColor Cyan
} else {
    Write-Host "⏭️  Skipping frontend deployment" -ForegroundColor Yellow
}

# Get deployment URLs
Write-Host "📋 Getting deployment URLs..." -ForegroundColor Yellow
$backendUrl = az webapp show --resource-group $ResourceGroupName --name $BackendAppName --query "defaultHostName" --output tsv
$frontendUrl = az staticwebapp show --resource-group $ResourceGroupName --name $FrontendAppName --query "defaultHostName" --output tsv

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment URLs:" -ForegroundColor Cyan
Write-Host "  Backend API: https://$backendUrl" -ForegroundColor White
Write-Host "  Frontend App: https://$frontendUrl" -ForegroundColor White
Write-Host "  API Health: https://$backendUrl/actuator/health" -ForegroundColor White
Write-Host "  API Docs: https://$backendUrl/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure GitHub Actions for CI/CD" -ForegroundColor White
Write-Host "2. Set up custom domain (optional)" -ForegroundColor White
Write-Host "3. Configure monitoring and alerts" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy deploying!" -ForegroundColor Green
