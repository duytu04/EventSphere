# ✅ EventSphere Monorepo Deployment Checklist

## 📋 Pre-Deployment Checklist

### Repository Structure
- [ ] Repository có cấu trúc monorepo
- [ ] Frontend code trong `/frontend`
- [ ] Backend code trong `/backend`
- [ ] GitHub Actions workflow trong `.github/workflows`
- [ ] Bicep template `azure-deploy.bicep` có
- [ ] Deployment script `deploy-azure.ps1` có

### Environment Setup
- [ ] Azure CLI đã cài đặt và cập nhật
- [ ] Docker Desktop đã cài đặt và chạy
- [ ] Git đã cài đặt
- [ ] Tài khoản Azure có quyền tạo resources
- [ ] Đã đăng nhập Azure CLI (`az login`)

### Configuration Files
- [ ] File `azure-deploy.bicep` đã cập nhật cho monorepo
- [ ] File `.github/workflows/azure-deploy.yml` đã cấu hình
- [ ] File `deploy-azure.ps1` đã cập nhật
- [ ] File `frontend/staticwebapp.config.json` có
- [ ] File `backend/src/main/resources/application-azure.yml` có
- [ ] File `azure-env.example` có

### Environment Variables
- [ ] File `.env.azure` đã được tạo từ template
- [ ] `AZURE_RESOURCE_GROUP` đã set
- [ ] `AZURE_LOCATION` đã set
- [ ] `REPOSITORY_URL` đã set
- [ ] `BRANCH_NAME` đã set
- [ ] `MYSQL_ADMIN_PASSWORD` đã set (mạnh)
- [ ] `JWT_SECRET` đã set (tối thiểu 32 ký tự)
- [ ] `MAIL_*` variables đã set (nếu cần)

---

## 🚀 Deployment Checklist

### Step 1: Infrastructure Deployment
- [ ] Resource Group đã tạo
- [ ] Bicep template đã deploy thành công
- [ ] MySQL Flexible Server đã tạo
- [ ] MySQL Database đã tạo
- [ ] App Service Plan đã tạo
- [ ] App Service đã tạo
- [ ] Static Web App đã tạo
- [ ] Azure Container Registry đã tạo

### Step 2: Backend Deployment
- [ ] Docker image đã build từ `/backend`
- [ ] Docker image đã push lên ACR
- [ ] App Service đã cấu hình sử dụng Docker image
- [ ] Environment variables đã set cho App Service
- [ ] Health check endpoint hoạt động

### Step 3: Frontend Deployment
- [ ] Static Web App đã cấu hình cho monorepo
- [ ] Build command đã set đúng (`cd frontend && npm ci && npm run build`)
- [ ] Output location đã set đúng (`dist`)
- [ ] Environment variables đã set
- [ ] GitHub Actions workflow đã cấu hình

### Step 4: Database Configuration
- [ ] MySQL server đã running
- [ ] Firewall rules đã cấu hình
- [ ] Database connection từ App Service hoạt động
- [ ] Database schema đã được tạo

---

## ✅ Post-Deployment Checklist

### Service Status
- [ ] **App Service**: Status = "Running"
- [ ] **Static Web App**: Status = "Running"
- [ ] **MySQL Server**: Status = "Ready"
- [ ] **ACR**: Status = "Running"

### Health Checks
- [ ] Backend health: `https://eventsphere-backend.azurewebsites.net/actuator/health`
- [ ] Response: `{"status":"UP"}`
- [ ] Database connection: `{"status":"UP","components":{"db":{"status":"UP"}}}`

### Frontend Testing
- [ ] Frontend URL: `https://eventsphere-frontend.azurestaticapps.net`
- [ ] Trang chủ load được
- [ ] Không có lỗi console (F12)
- [ ] API calls thành công (Network tab)

### Backend Testing
- [ ] API docs: `https://eventsphere-backend.azurewebsites.net/swagger-ui.html`
- [ ] Test API endpoints
- [ ] Database queries hoạt động
- [ ] Authentication flow hoạt động

### Security Checks
- [ ] HTTPS được enable cho tất cả services
- [ ] Environment variables không bị expose
- [ ] CORS configuration đúng
- [ ] Database chỉ accessible từ App Service

---

## 🔄 Selective Deployment Checklist

### Frontend Changes
- [ ] Thay đổi code trong `/frontend`
- [ ] Commit và push lên GitHub
- [ ] GitHub Actions detect changes trong `frontend/**`
- [ ] Chỉ frontend job chạy
- [ ] Frontend deploy thành công
- [ ] Backend không bị ảnh hưởng

### Backend Changes
- [ ] Thay đổi code trong `/backend`
- [ ] Commit và push lên GitHub
- [ ] GitHub Actions detect changes trong `backend/**`
- [ ] Chỉ backend job chạy
- [ ] Backend deploy thành công
- [ ] Frontend không bị ảnh hưởng

### Both Changes
- [ ] Thay đổi code trong cả `/frontend` và `/backend`
- [ ] Commit và push lên GitHub
- [ ] GitHub Actions detect changes trong cả hai
- [ ] Cả hai jobs chạy song song
- [ ] Cả hai deploy thành công

---

## 🔧 Troubleshooting Checklist

### Nếu Frontend không deploy:
- [ ] Kiểm tra GitHub Actions logs
- [ ] Kiểm tra `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] Kiểm tra build command trong workflow
- [ ] Kiểm tra path filters trong workflow
- [ ] Kiểm tra repository permissions

### Nếu Backend không deploy:
- [ ] Kiểm tra Docker build logs
- [ ] Kiểm tra ACR credentials
- [ ] Kiểm tra App Service configuration
- [ ] Kiểm tra path filters trong workflow
- [ ] Kiểm tra Docker image tags

### Nếu Database connection failed:
- [ ] Kiểm tra MySQL server logs
- [ ] Kiểm tra firewall rules
- [ ] Kiểm tra credentials
- [ ] Kiểm tra network connectivity
- [ ] Kiểm tra App Service environment variables

---

## 📊 Performance Checklist

### Backend Optimization
- [ ] JVM memory settings phù hợp
- [ ] Database connection pool tối ưu
- [ ] Caching được enable
- [ ] Logging level phù hợp (production)
- [ ] Docker image size tối ưu

### Frontend Optimization
- [ ] Code splitting hoạt động
- [ ] Assets được minify
- [ ] Images được optimize
- [ ] CDN được sử dụng (Azure CDN)
- [ ] Build time tối ưu

### Database Optimization
- [ ] Indexes được tạo đúng
- [ ] Query performance tốt
- [ ] Connection pooling hoạt động
- [ ] Backup strategy đã setup
- [ ] Monitoring queries

---

## 🎯 Final Verification

### User Experience
- [ ] Trang chủ load nhanh (< 3 giây)
- [ ] Navigation mượt mà
- [ ] Forms submit thành công
- [ ] Authentication hoạt động
- [ ] File upload/download hoạt động

### Admin Features
- [ ] Admin dashboard accessible
- [ ] User management hoạt động
- [ ] Event management hoạt động
- [ ] Analytics hoạt động

### Organizer Features
- [ ] Event creation hoạt động
- [ ] QR code generation hoạt động
- [ ] Attendance scanning hoạt động
- [ ] Media upload hoạt động

### Monorepo Benefits
- [ ] Selective deployment hoạt động
- [ ] CI/CD pipeline hiệu quả
- [ ] Shared dependencies được quản lý tốt
- [ ] Code sharing giữa frontend và backend
- [ ] Unified development workflow

---

## 🚨 Emergency Contacts

### Azure Support
- **Documentation**: https://docs.microsoft.com/azure
- **Community**: https://docs.microsoft.com/answers
- **Status**: https://status.azure.com
- **Support**: Azure Portal → Help + Support

### Project Team
- **GitHub Issues**: Tạo issue trong repository
- **Logs**: Azure Portal → App Service → Logs
- **Monitoring**: Azure Portal → Application Insights
- **CI/CD**: GitHub Actions → Workflow runs

---

## 📝 Notes

### Deployment URLs
- **Frontend**: https://eventsphere-frontend.azurestaticapps.net
- **Backend**: https://eventsphere-backend.azurewebsites.net
- **API Docs**: https://eventsphere-backend.azurewebsites.net/swagger-ui.html
- **Health Check**: https://eventsphere-backend.azurewebsites.net/actuator/health

### Important Files
- `azure-deploy.bicep` - Infrastructure configuration
- `deploy-azure.ps1` - Deployment script
- `.github/workflows/azure-deploy.yml` - CI/CD pipeline
- `.env.azure` - Environment variables
- `MONOREPO_DEPLOYMENT_GUIDE.md` - Detailed guide
- `monorepo-checklist.md` - This checklist

### Monorepo Structure
```
EventSphere/
├── frontend/          # React + Vite
├── backend/           # Spring Boot + Java
├── .github/workflows/ # CI/CD
├── azure-deploy.bicep # Infrastructure
└── deploy-azure.ps1   # Deployment script
```

### Next Steps After Deployment
1. Setup Application Insights monitoring
2. Configure custom domain (optional)
3. Setup automated backups
4. Performance monitoring
5. Security audit
6. Load testing
7. Setup staging environment

---

## 💰 Cost Monitoring

### Free Tier Limits
- **Static Web Apps**: 100GB bandwidth/month
- **App Service**: 1GB RAM, 1GB storage
- **MySQL**: 20GB storage
- **ACR**: 10GB storage

### Production Scaling
- **Static Web Apps**: Standard tier ($9/month)
- **App Service**: B1 tier ($13/month)
- **MySQL**: General Purpose ($25/month)
- **ACR**: Basic tier ($5/month)

### Monorepo Benefits
- **Reduced CI/CD costs**: Selective deployment
- **Shared infrastructure**: Single resource group
- **Unified monitoring**: Single dashboard
- **Simplified management**: One repository

---

**🎉 Chúc mừng! Nếu tất cả items đã được check, EventSphere Monorepo đã sẵn sàng production trên Azure!**
