# Script kiểm tra vùng Azure được phép deploy
# Chạy script này để tìm vùng phù hợp cho EventSphere

Write-Host "🔍 EventSphere Azure Region Checker" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Danh sách vùng Azure Static Web Apps hỗ trợ
$supportedRegions = @(
    "West US 2",
    "Central US", 
    "East US 2",
    "West Europe",
    "East Asia"
)

$workingRegions = @()
$failedRegions = @()

Write-Host "📋 Kiểm tra vùng Azure Static Web Apps được hỗ trợ..." -ForegroundColor Yellow
Write-Host ""

foreach ($region in $supportedRegions) {
    Write-Host "🔍 Testing region: $region" -ForegroundColor Cyan
    
    # Tạo tên resource group test unique
    $testRG = "eventsphere-test-$(Get-Random -Minimum 1000 -Maximum 9999)"
    
    try {
        # Test tạo resource group
        Write-Host "  Creating test resource group..." -NoNewline
        $result = az group create --name $testRG --location $region --query "name" --output tsv 2>$null
        
        if ($result -and $result -eq $testRG) {
            Write-Host " ✅" -ForegroundColor Green
            $workingRegions += $region
            
            # Xóa resource group test
            Write-Host "  Cleaning up test resource group..." -NoNewline
            az group delete --name $testRG --yes --no-wait 2>$null
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $failedRegions += $region
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $failedRegions += $region
    }
    
    Write-Host ""
}

# Hiển thị kết quả
Write-Host "📊 KẾT QUẢ KIỂM TRA" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host ""

if ($workingRegions.Count -gt 0) {
    Write-Host "✅ Các vùng CÓ THỂ SỬ DỤNG:" -ForegroundColor Green
    foreach ($region in $workingRegions) {
        Write-Host "  - $region" -ForegroundColor White
    }
    Write-Host ""
    
    # Khuyến nghị vùng tốt nhất
    $recommendations = @{
        "East Asia" = "Gần Việt Nam nhất (latency ~20-30ms)"
        "East US 2" = "Ổn định và đáng tin cậy (latency ~150-200ms)"
        "West Europe" = "Tốt cho người dùng châu Âu (latency ~200-250ms)"
        "Central US" = "Trung tâm Hoa Kỳ (latency ~180-220ms)"
        "West US 2" = "Tây Hoa Kỳ (latency ~200-250ms)"
    }
    
    Write-Host "🎯 KHUYẾN NGHỊ:" -ForegroundColor Cyan
    foreach ($region in $workingRegions) {
        if ($recommendations.ContainsKey($region)) {
            Write-Host "  - $region`: $($recommendations[$region])" -ForegroundColor White
        }
    }
    Write-Host ""
    
    # Tạo command deploy
    $bestRegion = $workingRegions[0]
    Write-Host "🚀 COMMAND DEPLOY VỚI VÙNG TỐT NHẤT:" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host ".\deploy-azure.ps1 \`" -ForegroundColor White
    Write-Host "    -ResourceGroupName `"eventsphere-rg`" \`" -ForegroundColor White
    Write-Host "    -Location `"$bestRegion`" \`" -ForegroundColor White
    Write-Host "    -EnvironmentName `"dev`" \`" -ForegroundColor White
    Write-Host "    -AppNamePrefix `"eventsphere`" \`" -ForegroundColor White
    Write-Host "    -RepositoryUrl `"https://github.com/yourusername/EventSphere`" \`" -ForegroundColor White
    Write-Host "    -MySqlAdminPassword `"MySecurePassword123!`" \`" -ForegroundColor White
    Write-Host "    -JwtSecret `"my-super-secret-jwt-key-for-azure-production-2024`"" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ KHÔNG CÓ VÙNG NÀO ĐƯỢC PHÉP!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 CÁCH KHẮC PHỤC:" -ForegroundColor Yellow
    Write-Host "1. Liên hệ Azure Support để mở thêm vùng" -ForegroundColor White
    Write-Host "2. Kiểm tra Azure Policy restrictions" -ForegroundColor White
    Write-Host "3. Thử với subscription khác" -ForegroundColor White
    Write-Host ""
}

if ($failedRegions.Count -gt 0) {
    Write-Host "❌ Các vùng KHÔNG ĐƯỢC PHÉP:" -ForegroundColor Red
    foreach ($region in $failedRegions) {
        Write-Host "  - $region" -ForegroundColor White
    }
    Write-Host ""
}

# Thông tin bổ sung
Write-Host "📚 THÔNG TIN BỔ SUNG:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Azure Static Web Apps chỉ hỗ trợ 5 vùng cụ thể" -ForegroundColor White
Write-Host "• Subscription có thể bị giới hạn bởi Azure Policy" -ForegroundColor White
Write-Host "• CDN sẽ giúp cải thiện performance cho người dùng xa" -ForegroundColor White
Write-Host "• Có thể liên hệ Azure Support để mở thêm vùng" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Hoàn thành kiểm tra!" -ForegroundColor Green
