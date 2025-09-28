# 🚀 EventSphere Azure Deployment Guide

## 📋 Tổng quan
- **Frontend**: Azure Static Web Apps (SWA)
- **Backend**: Azure App Service (Web App)
- **Database**: Azure Database for MySQL Flexible Server
- **Infrastructure**: Azure Bicep (IaC)

---

## 🔧 BƯỚC 1: Chuẩn bị môi trường

### 1.1 Yêu cầu hệ thống
- ✅ Azure CLI đã cài đặt
- ✅ Docker Desktop đã cài đặt
- ✅ Git đã cài đặt
- ✅ Tài khoản Azure với quyền tạo resources

### 1.2 Cài đặt Azure CLI
```powershell
# Windows (PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# Hoặc sử dụng winget
winget install Microsoft.AzureCLI
```

### 1.3 Đăng nhập Azure
```powershell
az login
az account set --subscription "Your Subscription Name"
```

---

## ⚙️ BƯỚC 2: Cấu hình Environment Variables

### 2.1 Tạo file cấu hình
```powershell
# Copy file template
cp azure-env.example .env.azure

# Chỉnh sửa file .env.azure với thông tin thực tế
```

### 2.2 Cập nhật các giá trị trong .env.azure
```env
# Azure Configuration
AZURE_RESOURCE_GROUP=eventsphere-rg
AZURE_LOCATION=East US
AZURE_ENVIRONMENT=dev
AZURE_APP_NAME_PREFIX=eventsphere

# Database Configuration
MYSQL_ADMIN_LOGIN=eventsphereadmin
MYSQL_ADMIN_PASSWORD=MySecurePassword123!

# JWT Configuration (tối thiểu 32 ký tự)
JWT_SECRET=my-super-secret-jwt-key-for-azure-production-2024

# Email Configuration (tùy chọn)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🚀 BƯỚC 3: Deploy Infrastructure

### 3.1 Sử dụng PowerShell Script (Khuyến nghị)
```powershell
# Chạy script deploy tự động
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -Location "East US" `
    -EnvironmentName "dev" `
    -AppNamePrefix "eventsphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

### 3.2 Deploy thủ công bằng Azure CLI
```powershell
# 1. Tạo Resource Group
az group create --name eventsphere-rg --location "East US"

# 2. Deploy Bicep template
az deployment group create `
    --resource-group eventsphere-rg `
    --template-file azure-deploy.bicep `
    --parameters `
        environmentName=dev `
        appNamePrefix=eventsphere `
        mysqlAdminPassword="MySecurePassword123!" `
        jwtSecret="my-super-secret-jwt-key-for-azure-production-2024"
```

---

## 🌐 BƯỚC 4: Deploy Frontend (Azure Static Web Apps)

### 4.1 Tạo Static Web App
```powershell
# Tạo Static Web App
az staticwebapp create `
    --name eventsphere-frontend `
    --resource-group eventsphere-rg `
    --source https://github.com/yourusername/EventSphere `
    --location "East US 2" `
    --branch main `
    --app-location "/frontend" `
    --output-location "dist" `
    --build-command "npm ci && npm run build"
```

### 4.2 Cấu hình GitHub Actions
1. Vào GitHub repository
2. Settings → Secrets and variables → Actions
3. Thêm secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `AZURE_WEBAPP_PUBLISH_PROFILE`

### 4.3 Cấu hình Environment Variables cho Frontend
```powershell
# Set environment variables
az staticwebapp appsettings set `
    --name eventsphere-frontend `
    --resource-group eventsphere-rg `
    --setting-names VITE_API_BASE_URL=https://eventsphere-backend.azurewebsites.net
```

---

## 🖥️ BƯỚC 5: Deploy Backend (Azure App Service)

### 5.1 Tạo App Service Plan
```powershell
# Tạo App Service Plan
az appservice plan create `
    --name eventsphere-plan `
    --resource-group eventsphere-rg `
    --location "East US" `
    --sku B1 `
    --is-linux
```

### 5.2 Tạo Web App
```powershell
# Tạo Web App
az webapp create `
    --resource-group eventsphere-rg `
    --plan eventsphere-plan `
    --name eventsphere-backend `
    --runtime "JAVA|11-java11"
```

### 5.3 Cấu hình Docker Container
```powershell
# Cấu hình container registry
az acr create --resource-group eventsphere-rg --name eventsphereacr --sku Basic

# Login to ACR
az acr login --name eventsphereacr

# Build và push Docker image
docker build -t eventsphereacr.azurecr.io/eventsphere-backend:latest ./backend
docker push eventsphereacr.azurecr.io/eventsphere-backend:latest

# Cấu hình Web App sử dụng Docker image
az webapp config container set `
    --name eventsphere-backend `
    --resource-group eventsphere-rg `
    --docker-custom-image-name eventsphereacr.azurecr.io/eventsphere-backend:latest
```

---

## 🗄️ BƯỚC 6: Cấu hình Database

### 6.1 Tạo MySQL Flexible Server
```powershell
# Tạo MySQL server
az mysql flexible-server create `
    --resource-group eventsphere-rg `
    --name eventsphere-mysql `
    --location "East US" `
    --admin-user eventsphereadmin `
    --admin-password "MySecurePassword123!" `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 20
```

### 6.2 Tạo Database
```powershell
# Tạo database
az mysql flexible-server db create `
    --resource-group eventsphere-rg `
    --server-name eventsphere-mysql `
    --database-name eventsphere
```

### 6.3 Cấu hình Firewall Rules
```powershell
# Cho phép Azure services
az mysql flexible-server firewall-rule create `
    --resource-group eventsphere-rg `
    --name eventsphere-mysql `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0
```

---

## ✅ BƯỚC 7: Kiểm tra Deployment

### 7.1 Kiểm tra Backend
```powershell
# Lấy URL backend
$backendUrl = az webapp show --resource-group eventsphere-rg --name eventsphere-backend --query "defaultHostName" --output tsv

# Test health check
curl "https://$backendUrl/actuator/health"

# Test API docs
curl "https://$backendUrl/swagger-ui.html"
```

### 7.2 Kiểm tra Frontend
```powershell
# Lấy URL frontend
$frontendUrl = az staticwebapp show --resource-group eventsphere-rg --name eventsphere-frontend --query "defaultHostName" --output tsv

# Test frontend
curl "https://$frontendUrl"
```

---

## 🔧 BƯỚC 8: Cấu hình CI/CD

### 8.1 GitHub Actions Workflow
File `.github/workflows/azure-deploy.yml` đã được tạo sẵn với:
- Build frontend và backend
- Deploy lên Azure Static Web Apps
- Deploy lên Azure App Service

### 8.2 Cấu hình Secrets
Trong GitHub repository, thêm các secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_WEBAPP_PUBLISH_PROFILE`

---

## 💰 Chi phí ước tính

### Free Tier (Development)
- **Static Web Apps**: Free (100GB bandwidth)
- **App Service**: Free (F1 tier)
- **MySQL**: Free (Basic tier)
- **Tổng**: $0/tháng

### Production Tier
- **Static Web Apps**: $9/tháng (Standard)
- **App Service**: $13/tháng (B1 tier)
- **MySQL**: $25/tháng (General Purpose)
- **ACR**: $5/tháng (Basic)
- **Tổng**: ~$52/tháng

---

## 🔍 Troubleshooting

### Lỗi thường gặp:

#### ❌ Backend không start được
```powershell
# Kiểm tra logs
az webapp log tail --name eventsphere-backend --resource-group eventsphere-rg

# Kiểm tra app settings
az webapp config appsettings list --name eventsphere-backend --resource-group eventsphere-rg
```

#### ❌ Frontend không kết nối được API
- Kiểm tra CORS settings trong backend
- Kiểm tra environment variables
- Kiểm tra network connectivity

#### ❌ Database connection failed
```powershell
# Kiểm tra firewall rules
az mysql flexible-server firewall-rule list --resource-group eventsphere-rg --name eventsphere-mysql

# Test connection
az mysql flexible-server connect --name eventsphere-mysql --admin-user eventsphereadmin --admin-password "MySecurePassword123!"
```

---

## 📊 Monitoring và Maintenance

### Application Insights
```powershell
# Tạo Application Insights
az monitor app-insights component create `
    --app eventsphere-insights `
    --location "East US" `
    --resource-group eventsphere-rg

# Cấu hình cho Web App
az webapp config appsettings set `
    --name eventsphere-backend `
    --resource-group eventsphere-rg `
    --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key"
```

### Backup Strategy
- **Database**: Azure tự động backup
- **Code**: GitHub repository
- **Configuration**: Azure Key Vault

---

## 🎯 Post-Deployment

### Custom Domain
```powershell
# Thêm custom domain cho Static Web App
az staticwebapp hostname set --name eventsphere-frontend --hostname yourdomain.com

# Thêm custom domain cho App Service
az webapp config hostname add --webapp-name eventsphere-backend --resource-group eventsphere-rg --hostname api.yourdomain.com
```

### SSL Certificate
- Azure tự động cung cấp SSL certificate
- Custom domain cần cấu hình DNS records

---

## 🆘 Support

### Azure Support
- **Documentation**: https://docs.microsoft.com/azure
- **Community**: https://docs.microsoft.com/answers
- **Status**: https://status.azure.com

### Project Support
- **GitHub Issues**: Tạo issue trong repository
- **Logs**: Azure Portal → App Service → Logs
- **Monitoring**: Azure Portal → Application Insights

---

## ✅ Checklist Deploy

- [ ] Azure CLI đã cài đặt và login
- [ ] Docker Desktop đã cài đặt
- [ ] File .env.azure đã cấu hình
- [ ] Resource Group đã tạo
- [ ] Infrastructure đã deploy (Bicep)
- [ ] MySQL server đã tạo và cấu hình
- [ ] Backend đã deploy lên App Service
- [ ] Frontend đã deploy lên Static Web Apps
- [ ] CI/CD pipeline đã cấu hình
- [ ] Health checks pass
- [ ] API connection working
- [ ] Database connection working

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:
- ✅ Frontend chạy trên Azure Static Web Apps
- ✅ Backend chạy trên Azure App Service
- ✅ Database chạy trên Azure MySQL Flexible Server
- ✅ CI/CD pipeline với GitHub Actions
- ✅ SSL certificates tự động
- ✅ Monitoring và logging

**Chúc mừng! EventSphere đã được deploy thành công lên Azure! 🚀**
