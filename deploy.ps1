# EventSphere Deploy Script for Windows PowerShell
# Chạy script này để chuẩn bị deploy lên Render

Write-Host "🚀 EventSphere Deploy Preparation Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Kiểm tra Git repository
Write-Host "📋 Checking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository found" -ForegroundColor Green
} else {
    Write-Host "❌ Git repository not found. Please initialize Git first." -ForegroundColor Red
    exit 1
}

# Kiểm tra file render.yaml
Write-Host "📋 Checking render.yaml..." -ForegroundColor Yellow
if (Test-Path "render.yaml") {
    Write-Host "✅ render.yaml found" -ForegroundColor Green
} else {
    Write-Host "❌ render.yaml not found. Please create it first." -ForegroundColor Red
    exit 1
}

# Kiểm tra file .env
Write-Host "📋 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your actual values before deploying!" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found. Please create it first." -ForegroundColor Red
        exit 1
    }
}

# Kiểm tra .gitignore
Write-Host "📋 Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "✅ .env is in .gitignore" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Adding .env to .gitignore..." -ForegroundColor Yellow
        Add-Content ".gitignore" "`n# Environment variables`n.env`n"
        Write-Host "✅ .env added to .gitignore" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Creating .gitignore..." -ForegroundColor Yellow
    @"
# Environment variables
.env

# Dependencies
node_modules/
target/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ .gitignore created" -ForegroundColor Green
}

# Kiểm tra Git status
Write-Host "📋 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Uncommitted changes found:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host ""
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Prepare for Render deployment"
        }
        git add .
        git commit -m $commitMessage
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Kiểm tra remote repository
Write-Host "📋 Checking remote repository..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ Remote repository: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "❌ No remote repository found. Please add GitHub remote first." -ForegroundColor Red
    Write-Host "Run: git remote add origin https://github.com/yourusername/EventSphere.git" -ForegroundColor Yellow
    exit 1
}

# Push to GitHub
Write-Host "📋 Pushing to GitHub..." -ForegroundColor Yellow
$push = Read-Host "Do you want to push to GitHub now? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Preparation completed!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Sign up/Login with GitHub" -ForegroundColor White
Write-Host "3. Click 'New +' → 'Blueprint'" -ForegroundColor White
Write-Host "4. Select your EventSphere repository" -ForegroundColor White
Write-Host "5. Click 'Apply' to create services" -ForegroundColor White
Write-Host "6. Configure environment variables in Render Dashboard" -ForegroundColor White
Write-Host "7. Deploy and test!" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - DEPLOYMENT_STEP_BY_STEP.md" -ForegroundColor White
Write-Host "   - deploy-checklist.md" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy deploying!" -ForegroundColor Green
