# 🔧 Khắc phục lỗi Azure Policy - Region Restriction

## ❌ Lỗi gặp phải
```
InvalidTemplateDeployment: The template deployment failed because of policy violation
RequestDisallowedByAzure: Resource 'EventSphere' was disallowed by Azure
```

## 🔍 Nguyên nhân
Subscription của bạn bị giới hạn bởi Azure Policy chỉ cho phép deploy ở một số vùng nhất định, không phải tất cả 5 vùng mà Azure Static Web Apps hỗ trợ.

---

## 🚀 Giải pháp

### Bước 1: Kiểm tra vùng được phép

```powershell
# Kiểm tra vùng có sẵn trong subscription
az account list-locations --query "[].{Name:name, DisplayName:displayName}" --output table

# Kiểm tra vùng được phép deploy
az provider show --namespace Microsoft.Web --query "resourceTypes[?resourceType=='staticSites'].locations[]" --output table
```

### Bước 2: Tìm vùng phù hợp

Chạy script sau để tìm vùng phù hợp nhất:

```powershell
# Script kiểm tra vùng
$allowedRegions = @(
    "West US 2",
    "Central US", 
    "East US 2",
    "West Europe",
    "East Asia"
)

Write-Host "🔍 Kiểm tra vùng được phép trong subscription..." -ForegroundColor Yellow

foreach ($region in $allowedRegions) {
    Write-Host "Testing region: $region" -ForegroundColor Cyan
    
    # Test tạo resource group tạm thời
    $testRG = "test-rg-$(Get-Random)"
    $result = az group create --name $testRG --location $region --query "name" --output tsv 2>$null
    
    if ($result) {
        Write-Host "✅ $region - CÓ THỂ SỬ DỤNG" -ForegroundColor Green
        az group delete --name $testRG --yes --no-wait 2>$null
    } else {
        Write-Host "❌ $region - KHÔNG ĐƯỢC PHÉP" -ForegroundColor Red
    }
}
```

### Bước 3: Cập nhật cấu hình với vùng được phép

Sau khi tìm được vùng phù hợp, cập nhật file cấu hình:

```powershell
# Ví dụ nếu chỉ có thể dùng "West Europe"
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -Location "West Europe" `
    -EnvironmentName "dev" `
    -AppNamePrefix "eventsphere" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

---

## 🔄 Cập nhật Bicep Template

Nếu cần, tôi có thể cập nhật Bicep template để chỉ sử dụng vùng được phép:

```bicep
@description('Location for all resources (must be supported by Azure Static Web Apps and your subscription)')
@allowed([
  'West Europe',  // Thay đổi theo vùng được phép
  'East US 2'     // Thêm vùng khác nếu cần
])
param location string = 'West Europe'  // Vùng mặc định
```

---

## 📞 Liên hệ Azure Support

Nếu cần thêm vùng:

1. **Azure Portal** → Help + Support
2. **Tạo support request** với tiêu đề: "Request additional Azure regions for deployment"
3. **Mô tả**: Cần deploy Azure Static Web Apps ở vùng gần Việt Nam (East Asia hoặc East US 2)
4. **Business justification**: 
   - Latency optimization cho người dùng Việt Nam
   - Better user experience
   - Compliance requirements

---

## 🎯 Vùng thay thế khuyến nghị

### Nếu chỉ có thể dùng "West Europe":
- **Latency từ Việt Nam**: ~200-250ms
- **Vẫn chấp nhận được** cho production
- **CDN sẽ giúp cải thiện** performance

### Nếu có thể dùng "East US 2":
- **Latency từ Việt Nam**: ~150-200ms  
- **Tốt hơn West Europe**
- **Khuyến nghị** nếu có thể

---

## 🔧 Script tự động tìm vùng

Tôi sẽ tạo script để tự động tìm vùng phù hợp:

```powershell
# Script tìm vùng phù hợp
$regions = @("West US 2", "Central US", "East US 2", "West Europe", "East Asia")
$workingRegions = @()

Write-Host "🔍 Đang kiểm tra vùng được phép..." -ForegroundColor Yellow

foreach ($region in $regions) {
    $testRG = "test-rg-$(Get-Random)"
    try {
        $result = az group create --name $testRG --location $region --query "name" --output tsv 2>$null
        if ($result) {
            $workingRegions += $region
            Write-Host "✅ $region - OK" -ForegroundColor Green
            az group delete --name $testRG --yes --no-wait 2>$null
        }
    } catch {
        Write-Host "❌ $region - Không được phép" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Các vùng có thể sử dụng:" -ForegroundColor Cyan
$workingRegions | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

if ($workingRegions.Count -eq 0) {
    Write-Host "❌ Không có vùng nào được phép. Vui lòng liên hệ Azure Support." -ForegroundColor Red
} else {
    $recommended = $workingRegions[0]
    Write-Host "`n🚀 Khuyến nghị sử dụng: $recommended" -ForegroundColor Green
}
```

---

## 📋 Checklist khắc phục

- [ ] Chạy script kiểm tra vùng
- [ ] Xác định vùng được phép
- [ ] Cập nhật deployment script với vùng mới
- [ ] Test deploy với vùng mới
- [ ] Liên hệ Azure Support nếu cần thêm vùng
- [ ] Cập nhật documentation

---

## 🎉 Kết luận

Lỗi này rất phổ biến với Azure subscriptions mới. Sau khi tìm được vùng phù hợp, deployment sẽ hoạt động bình thường. Vùng "West Europe" vẫn cho performance tốt với CDN của Azure Static Web Apps.
