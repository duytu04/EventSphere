# 🚀 EventSphere Monorepo Azure Deployment Guide

## 📋 Tổng quan Monorepo
- **Cấu trúc**: Monorepo với frontend và backend trong cùng repository
- **Frontend**: Azure Static Web Apps (từ `/frontend`)
- **Backend**: Azure App Service (từ `/backend`)
- **Database**: Azure Database for MySQL Flexible Server
- **CI/CD**: GitHub Actions với selective deployment

---

## 🏗️ Cấu trúc Monorepo

```
EventSphere/
├── frontend/                    # React + Vite frontend
│   ├── src/                    # Source code
│   ├── package.json            # Dependencies
│   ├── vite.config.ts          # Build config
│   └── staticwebapp.config.json # SWA config
├── backend/                     # Spring Boot backend
│   ├── src/                    # Source code
│   ├── pom.xml                 # Maven dependencies
│   ├── Dockerfile              # Multi-stage build
│   └── src/main/resources/
│       └── application-azure.yml # Azure config
├── .github/
│   └── workflows/
│       └── azure-deploy.yml    # CI/CD pipeline
├── azure-deploy.bicep          # Infrastructure as Code
├── deploy-azure.ps1            # Deployment script
└── azure-env.example           # Environment template
```

---

## 🔧 BƯỚC 1: Chuẩn bị Monorepo

### 1.1 Cấu trúc Repository
Đảm bảo repository có cấu trúc monorepo:
```
your-username/EventSphere
├── frontend/     # Frontend code
├── backend/      # Backend code
└── .github/      # CI/CD workflows
```

### 1.2 Cấu hình Environment Variables
```powershell
# Copy template
cp azure-env.example .env.azure

# Cập nhật với thông tin thực tế
```

```env
# Azure Configuration
AZURE_RESOURCE_GROUP=eventsphere-rg
AZURE_LOCATION=East US
AZURE_ENVIRONMENT=dev
AZURE_APP_NAME_PREFIX=eventsphere

# Repository Configuration
REPOSITORY_URL=https://github.com/yourusername/EventSphere
BRANCH_NAME=main

# Database Configuration
MYSQL_ADMIN_LOGIN=eventsphereadmin
MYSQL_ADMIN_PASSWORD=MySecurePassword123!

# JWT Configuration
JWT_SECRET=my-super-secret-jwt-key-for-azure-production-2024

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🚀 BƯỚC 2: Deploy Infrastructure

### 2.1 Deploy toàn bộ (Infrastructure + Apps)
```powershell
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -Location "East US" `
    -EnvironmentName "dev" `
    -AppNamePrefix "eventsphere" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -BranchName "main" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024"
```

### 2.2 Deploy từng phần riêng biệt

#### Chỉ deploy Infrastructure:
```powershell
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024" `
    -DeployFrontend:$false `
    -DeployBackend:$false
```

#### Chỉ deploy Backend:
```powershell
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024" `
    -DeployInfrastructure:$false `
    -DeployFrontend:$false
```

#### Chỉ deploy Frontend:
```powershell
.\deploy-azure.ps1 `
    -ResourceGroupName "eventsphere-rg" `
    -RepositoryUrl "https://github.com/yourusername/EventSphere" `
    -MySqlAdminPassword "MySecurePassword123!" `
    -JwtSecret "my-super-secret-jwt-key-for-azure-production-2024" `
    -DeployInfrastructure:$false `
    -DeployBackend:$false
```

---

## 🔄 BƯỚC 3: Cấu hình CI/CD

### 3.1 GitHub Actions Workflow
File `.github/workflows/azure-deploy.yml` đã được cấu hình với:
- **Selective deployment**: Chỉ deploy khi có thay đổi
- **Path-based triggers**: 
  - `frontend/**` → Deploy frontend
  - `backend/**` → Deploy backend
- **Parallel jobs**: Frontend và backend deploy song song
- **Infrastructure deployment**: Chỉ trên main branch

### 3.2 Cấu hình GitHub Secrets
Trong GitHub repository, thêm các secrets:

#### Required Secrets:
- `AZURE_CREDENTIALS` - Azure service principal
- `AZURE_RESOURCE_GROUP` - Resource group name
- `MYSQL_ADMIN_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key

#### Optional Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - For SWA deployment
- `AZURE_WEBAPP_PUBLISH_PROFILE` - For App Service deployment
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password

### 3.3 Tạo Azure Service Principal
```powershell
# Tạo service principal
az ad sp create-for-rbac --name "EventSphere-CI" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/eventsphere-rg --sdk-auth

# Copy output JSON và paste vào GitHub Secrets > AZURE_CREDENTIALS
```

---

## 🌐 BƯỚC 4: Deploy Frontend (Azure Static Web Apps)

### 4.1 Tạo Static Web App
```powershell
# Tạo Static Web App cho monorepo
az staticwebapp create `
    --name eventsphere-frontend `
    --resource-group eventsphere-rg `
    --source https://github.com/yourusername/EventSphere `
    --location "East US 2" `
    --branch main `
    --app-location "/frontend" `
    --output-location "dist" `
    --build-command "cd frontend && npm ci && npm run build"
```

### 4.2 Cấu hình Environment Variables
```powershell
# Set environment variables cho frontend
az staticwebapp appsettings set `
    --name eventsphere-frontend `
    --resource-group eventsphere-rg `
    --setting-names VITE_API_BASE_URL=https://eventsphere-backend.azurewebsites.net
```

### 4.3 Deploy thủ công
```powershell
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy từ thư mục frontend
cd frontend
swa deploy --app-location . --output-location dist
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

### 5.3 Deploy với Docker
```powershell
# Tạo Azure Container Registry
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

### 6.3 Cấu hình Firewall
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

### 7.3 Kiểm tra Database
```powershell
# Test database connection
az mysql flexible-server connect --name eventsphere-mysql --admin-user eventsphereadmin --admin-password "MySecurePassword123!"
```

---

## 🔄 BƯỚC 8: Selective Deployment

### 8.1 Deploy chỉ Frontend
```bash
# Chỉ thay đổi frontend code
git add frontend/
git commit -m "Update frontend"
git push origin main

# GitHub Actions sẽ tự động detect và chỉ deploy frontend
```

### 8.2 Deploy chỉ Backend
```bash
# Chỉ thay đổi backend code
git add backend/
git commit -m "Update backend"
git push origin main

# GitHub Actions sẽ tự động detect và chỉ deploy backend
```

### 8.3 Deploy cả hai
```bash
# Thay đổi cả frontend và backend
git add frontend/ backend/
git commit -m "Update both frontend and backend"
git push origin main

# GitHub Actions sẽ deploy cả hai song song
```

---

## 🔧 BƯỚC 9: Troubleshooting

### 9.1 Lỗi thường gặp

#### ❌ Frontend không deploy
- Kiểm tra GitHub Actions logs
- Kiểm tra `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Kiểm tra build command trong workflow

#### ❌ Backend không deploy
- Kiểm tra Docker build logs
- Kiểm tra ACR credentials
- Kiểm tra App Service configuration

#### ❌ Database connection failed
- Kiểm tra firewall rules
- Kiểm tra credentials
- Kiểm tra network connectivity

### 9.2 Debug Commands
```powershell
# Xem logs App Service
az webapp log tail --name eventsphere-backend --resource-group eventsphere-rg

# Xem logs Static Web App
az staticwebapp logs --name eventsphere-frontend --resource-group eventsphere-rg

# Kiểm tra App Service settings
az webapp config appsettings list --name eventsphere-backend --resource-group eventsphere-rg
```

---

## 📊 BƯỚC 10: Monitoring và Maintenance

### 10.1 Application Insights
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

### 10.2 Backup Strategy
- **Database**: Azure tự động backup
- **Code**: GitHub repository
- **Configuration**: Azure Key Vault

### 10.3 Scaling
- **Frontend**: Auto-scaling với CDN
- **Backend**: Manual scaling hoặc auto-scaling
- **Database**: Vertical scaling

---

## 💰 Chi phí Monorepo

### Free Tier (Development)
- **Static Web Apps**: Free (100GB bandwidth)
- **App Service**: Free (F1 tier)
- **MySQL**: Free (Basic tier)
- **ACR**: Free (Basic tier)
- **Tổng**: $0/tháng

### Production Tier
- **Static Web Apps**: $9/tháng (Standard)
- **App Service**: $13/tháng (B1 tier)
- **MySQL**: $25/tháng (General Purpose)
- **ACR**: $5/tháng (Basic)
- **Tổng**: ~$52/tháng

---

## 🎯 Lợi ích Monorepo

### 1. **Unified Development**
- Cùng một repository
- Shared dependencies
- Consistent tooling

### 2. **Selective Deployment**
- Deploy chỉ phần thay đổi
- Faster CI/CD
- Reduced costs

### 3. **Simplified Management**
- Single source of truth
- Easier versioning
- Unified documentation

### 4. **Better Collaboration**
- Shared code standards
- Easier code review
- Cross-team visibility

---

## ✅ Checklist Monorepo Deploy

- [ ] Repository có cấu trúc monorepo
- [ ] GitHub Actions workflow đã cấu hình
- [ ] GitHub Secrets đã set
- [ ] Azure service principal đã tạo
- [ ] Infrastructure đã deploy
- [ ] Frontend đã deploy lên SWA
- [ ] Backend đã deploy lên App Service
- [ ] Database đã cấu hình
- [ ] Health checks pass
- [ ] Selective deployment hoạt động
- [ ] Monitoring đã setup

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:
- ✅ Monorepo với selective deployment
- ✅ Frontend chạy trên Azure Static Web Apps
- ✅ Backend chạy trên Azure App Service
- ✅ Database chạy trên Azure MySQL Flexible Server
- ✅ CI/CD pipeline với GitHub Actions
- ✅ Selective deployment based on changes
- ✅ Monitoring và logging

**Chúc mừng! EventSphere Monorepo đã được deploy thành công lên Azure! 🚀**
