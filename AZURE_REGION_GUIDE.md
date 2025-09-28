# 🌍 Hướng dẫn chọn vùng Azure cho EventSphere

## 📋 Các vùng được hỗ trợ bởi Azure Static Web Apps

Azure Static Web Apps chỉ hỗ trợ một số vùng nhất định. Dưới đây là danh sách các vùng có sẵn:

| Vùng | Mã vùng | Mô tả | Khuyến nghị cho Việt Nam |
|------|---------|-------|-------------------------|
| **West US 2** | `westus2` | Tây Hoa Kỳ 2 | ❌ Xa nhất |
| **Central US** | `centralus` | Trung tâm Hoa Kỳ | ❌ Xa |
| **East US 2** | `eastus2` | Đông Hoa Kỳ 2 | ✅ **Khuyến nghị** |
| **West Europe** | `westeurope` | Tây Âu | ⚠️ Trung bình |
| **East Asia** | `eastasia` | Đông Á (Hong Kong) | ✅ **Gần nhất** |

---

## 🎯 Khuyến nghị cho Việt Nam

### 1. **East Asia (Đông Á) - Khuyến nghị cao nhất**
- **Vị trí**: Hong Kong
- **Khoảng cách**: ~1,200km từ Hà Nội
- **Latency**: ~20-30ms
- **Ưu điểm**:
  - Gần Việt Nam nhất
  - Latency thấp nhất
  - Phù hợp cho người dùng Việt Nam
- **Nhược điểm**:
  - Có thể có giới hạn về compliance
  - Chi phí có thể cao hơn

### 2. **East US 2 (Đông Hoa Kỳ 2) - Khuyến nghị**
- **Vị trí**: Virginia, USA
- **Khoảng cách**: ~14,000km từ Hà Nội
- **Latency**: ~150-200ms
- **Ưu điểm**:
  - Ổn định và đáng tin cậy
  - Chi phí hợp lý
  - Hỗ trợ tốt
  - Phù hợp cho production
- **Nhược điểm**:
  - Latency cao hơn East Asia

---

## 🔧 Cách thay đổi vùng

### 1. Trong PowerShell Script
```powershell
# Sử dụng East Asia (gần nhất)
.\deploy-azure.ps1 -Location "East Asia" -ResourceGroupName "eventsphere-rg" -RepositoryUrl "https://github.com/yourusername/EventSphere" -MySqlAdminPassword "password" -JwtSecret "secret"

# Sử dụng East US 2 (khuyến nghị)
.\deploy-azure.ps1 -Location "East US 2" -ResourceGroupName "eventsphere-rg" -RepositoryUrl "https://github.com/yourusername/EventSphere" -MySqlAdminPassword "password" -JwtSecret "secret"
```

### 2. Trong Bicep Template
```bicep
// Thay đổi default location
param location string = 'East Asia'  // hoặc 'East US 2'
```

### 3. Trong Environment Variables
```env
# .env.azure
AZURE_LOCATION=East Asia
# hoặc
AZURE_LOCATION=East US 2
```

---

## 📊 So sánh chi tiết

### Latency từ Việt Nam
| Vùng | Latency (ms) | Chất lượng |
|------|--------------|------------|
| East Asia | 20-30 | ⭐⭐⭐⭐⭐ |
| East US 2 | 150-200 | ⭐⭐⭐⭐ |
| West Europe | 200-250 | ⭐⭐⭐ |
| Central US | 180-220 | ⭐⭐⭐ |
| West US 2 | 200-250 | ⭐⭐⭐ |

### Chi phí (ước tính)
| Vùng | Static Web Apps | App Service | MySQL | Tổng |
|------|----------------|-------------|-------|------|
| East Asia | $9 | $13 | $25 | $47 |
| East US 2 | $9 | $13 | $25 | $47 |
| West Europe | $9 | $13 | $25 | $47 |
| Central US | $9 | $13 | $25 | $47 |
| West US 2 | $9 | $13 | $25 | $47 |

*Chi phí tương đương nhau cho tất cả vùng*

---

## 🚀 Hướng dẫn deploy theo vùng

### Deploy với East Asia (Khuyến nghị cho Việt Nam)
```powershell
# 1. Cập nhật environment
$env:AZURE_LOCATION = "East Asia"

# 2. Deploy
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -Location "East Asia" `
    -EnvironmentName "prod" `
    -AppNamePrefix "eventsphere" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

### Deploy với East US 2 (Khuyến nghị cho production)
```powershell
# 1. Cập nhật environment
$env:AZURE_LOCATION = "East US 2"

# 2. Deploy
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -Location "East US 2" `
    -EnvironmentName "prod" `
    -AppNamePrefix "eventsphere" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

---

## 🔄 Thay đổi vùng sau khi deploy

### 1. Tạo Resource Group mới
```powershell
# Tạo resource group mới ở vùng mới
az group create --name eventsphere-rg-new --location "East Asia"
```

### 2. Deploy lại infrastructure
```powershell
# Deploy với vùng mới
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg-new" `
    -Location "East Asia" `
    -EnvironmentName "prod" `
    -AppNamePrefix "eventsphere" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

### 3. Migrate dữ liệu
```powershell
# Export database từ vùng cũ
az mysql flexible-server export `
    --resource-group eventsphere-rg `
    --name eventsphere-mysql `
    --file-uri "https://yourstorageaccount.blob.core.windows.net/backup/eventsphere-backup.sql"

# Import database vào vùng mới
az mysql flexible-server import `
    --resource-group eventsphere-rg-new `
    --name eventsphere-mysql-new `
    --file-uri "https://yourstorageaccount.blob.core.windows.net/backup/eventsphere-backup.sql"
```

---

## ⚠️ Lưu ý quan trọng

### 1. **Compliance và Data Residency**
- Một số tổ chức yêu cầu dữ liệu phải ở vùng cụ thể
- Kiểm tra yêu cầu compliance trước khi chọn vùng

### 2. **Backup và Disaster Recovery**
- Nên có backup ở vùng khác
- Cân nhắc multi-region deployment cho production

### 3. **Monitoring**
- Monitor latency từ vùng thực tế của người dùng
- Sử dụng Azure Application Insights để đo performance

### 4. **CDN**
- Azure Static Web Apps tự động có CDN
- CDN sẽ cache content gần người dùng nhất

---

## 🎯 Kết luận

### Cho Development/Testing:
- **East US 2**: Ổn định, chi phí hợp lý

### Cho Production tại Việt Nam:
- **East Asia**: Latency thấp nhất, trải nghiệm người dùng tốt nhất
- **East US 2**: Nếu cần compliance hoặc ổn định cao

### Cho Global Users:
- **East US 2**: Cân bằng tốt cho người dùng toàn cầu

---

## 📞 Hỗ trợ

Nếu cần hỗ trợ chọn vùng hoặc migrate:
- **Azure Documentation**: https://docs.microsoft.com/azure
- **Azure Support**: Azure Portal → Help + Support
- **Community**: https://docs.microsoft.com/answers
