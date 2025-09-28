# ✅ Azure Deployment Checklist

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Azure CLI đã cài đặt và cập nhật
- [ ] Docker Desktop đã cài đặt và chạy
- [ ] Git đã cài đặt
- [ ] Tài khoản Azure có quyền tạo resources
- [ ] Đã đăng nhập Azure CLI (`az login`)

### Configuration Files
- [ ] File `azure-deploy.bicep` đã có
- [ ] File `deploy-azure.ps1` đã có
- [ ] File `.github/workflows/azure-deploy.yml` đã có
- [ ] File `azure-env.example` đã có
- [ ] File `frontend/staticwebapp.config.json` đã có
- [ ] File `backend/src/main/resources/application-azure.yml` đã có

### Environment Variables
- [ ] File `.env.azure` đã được tạo từ template
- [ ] `AZURE_RESOURCE_GROUP` đã set
- [ ] `AZURE_LOCATION` đã set
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

### Step 2: Backend Deployment
- [ ] Azure Container Registry đã tạo
- [ ] Docker image đã build
- [ ] Docker image đã push lên ACR
- [ ] App Service đã cấu hình sử dụng Docker image
- [ ] Environment variables đã set cho App Service
- [ ] Health check endpoint hoạt động

### Step 3: Frontend Deployment
- [ ] Static Web App đã cấu hình
- [ ] Build command đã set đúng
- [ ] Output location đã set đúng
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

## 🔧 Troubleshooting Checklist

### Nếu Backend không start:
- [ ] Kiểm tra logs trong Azure Portal
- [ ] Kiểm tra MySQL server đã running
- [ ] Kiểm tra environment variables
- [ ] Kiểm tra Docker image đã push đúng
- [ ] Kiểm tra App Service configuration

### Nếu Frontend không kết nối API:
- [ ] Kiểm tra `VITE_API_BASE_URL` đúng
- [ ] Kiểm tra backend service đã running
- [ ] Kiểm tra CORS settings
- [ ] Test API trực tiếp bằng curl

### Nếu Database connection failed:
- [ ] Kiểm tra MySQL server logs
- [ ] Kiểm tra firewall rules
- [ ] Kiểm tra credentials
- [ ] Kiểm tra network connectivity

---

## 📊 Performance Checklist

### Backend Optimization
- [ ] JVM memory settings phù hợp
- [ ] Database connection pool tối ưu
- [ ] Caching được enable
- [ ] Logging level phù hợp (production)

### Frontend Optimization
- [ ] Code splitting hoạt động
- [ ] Assets được minify
- [ ] Images được optimize
- [ ] CDN được sử dụng (Azure CDN)

### Database Optimization
- [ ] Indexes được tạo đúng
- [ ] Query performance tốt
- [ ] Connection pooling hoạt động
- [ ] Backup strategy đã setup

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
- `.env.azure` - Environment variables
- `AZURE_DEPLOYMENT_GUIDE.md` - Detailed guide
- `azure-checklist.md` - This checklist

### Next Steps After Deployment
1. Setup Application Insights monitoring
2. Configure custom domain (optional)
3. Setup automated backups
4. Performance monitoring
5. Security audit
6. Load testing

---

## 💰 Cost Monitoring

### Free Tier Limits
- **Static Web Apps**: 100GB bandwidth/month
- **App Service**: 1GB RAM, 1GB storage
- **MySQL**: 20GB storage

### Production Scaling
- **Static Web Apps**: Standard tier ($9/month)
- **App Service**: B1 tier ($13/month)
- **MySQL**: General Purpose ($25/month)
- **ACR**: Basic tier ($5/month)

---

**🎉 Chúc mừng! Nếu tất cả items đã được check, EventSphere đã sẵn sàng production trên Azure!**
