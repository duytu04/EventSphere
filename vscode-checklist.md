# ✅ VS Code Deployment Checklist

## 📋 Pre-Deployment Checklist

### VS Code Setup

- [ ] VS Code đã cài đặt và cập nhật
- [ ] Azure Tools Extension Pack đã cài đặt
- [ ] Java Extension Pack đã cài đặt
- [ ] Docker Extension đã cài đặt
- [ ] Đã đăng nhập Azure account
- [ ] Azure subscription đã được chọn

### Project Configuration

- [ ] File `.vscode/launch.json` có
- [ ] File `.vscode/tasks.json` có
- [ ] File `.vscode/settings.json` có
- [ ] File `.vscode/extensions.json` có
- [ ] File `.vscode/azure.json` có
- [ ] File `env.example` có

### Environment Setup

- [ ] File `.env` đã được tạo từ template
- [ ] Database credentials đã cấu hình
- [ ] JWT secret đã set (tối thiểu 32 ký tự)
- [ ] CORS origins đã cấu hình
- [ ] Frontend API URLs đã set

---

## 🚀 Deployment Checklist

### Step 1: Azure Resources Creation

- [ ] Resource Group đã tạo (`eventsphere-rg`)
- [ ] MySQL Flexible Server đã tạo
- [ ] MySQL Database đã tạo (`eventsphere`)
- [ ] App Service Plan đã tạo
- [ ] Web App đã tạo (`eventsphere-backend`)
- [ ] Static Web App đã tạo (`eventsphere-frontend`)

### Step 2: Backend Deployment

- [ ] Backend code đã build thành công
- [ ] Web App đã deploy backend code
- [ ] Environment variables đã set cho App Service
- [ ] Database connection đã cấu hình
- [ ] Health check endpoint hoạt động

### Step 3: Frontend Deployment

- [ ] Frontend dependencies đã install
- [ ] Frontend đã build thành công
- [ ] Static Web App đã deploy frontend
- [ ] Environment variables đã set cho SWA
- [ ] Frontend load được và kết nối API

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

## 🔧 VS Code Features Checklist

### Development Features

- [ ] **Launch Configurations**: Backend debugging hoạt động
- [ ] **Tasks**: Build tasks hoạt động
- [ ] **IntelliSense**: Java và TypeScript autocomplete
- [ ] **Debugging**: Breakpoints hoạt động
- [ ] **Integrated Terminal**: Commands chạy được

### Azure Integration

- [ ] **Azure Explorer**: Hiển thị resources
- [ ] **Deploy Commands**: Deploy từ Command Palette
- [ ] **Logs Streaming**: Xem logs real-time
- [ ] **Resource Management**: Start/Stop/Restart resources
- [ ] **Settings Management**: Cấu hình environment variables

### Monitoring Features

- [ ] **Application Insights**: Monitoring hoạt động
- [ ] **Logs View**: Xem logs từ VS Code
- [ ] **Performance Monitoring**: Metrics hiển thị
- [ ] **Error Tracking**: Lỗi được track

---

## 🔄 Development Workflow Checklist

### Local Development

- [ ] **Start Backend**: Task "Start Backend Dev Server" hoạt động
- [ ] **Start Frontend**: Task "Start Frontend Dev Server" hoạt động
- [ ] **Docker Compose**: Task "Docker Compose: Start All Services" hoạt động
- [ ] **Hot Reload**: Code changes được detect
- [ ] **Debug Mode**: F5 debugging hoạt động

### Deployment Workflow

- [ ] **Build Tasks**: Build Backend và Frontend tasks hoạt động
- [ ] **Deploy Commands**: Deploy commands từ Command Palette
- [ ] **Environment Switching**: Switch giữa dev/prod
- [ ] **Rollback**: Rollback deployment nếu cần
- [ ] **Monitoring**: Monitor deployment progress

---

## 🔧 Troubleshooting Checklist

### Nếu Backend không deploy:

- [ ] Kiểm tra Azure Explorer logs
- [ ] Kiểm tra App Service settings
- [ ] Kiểm tra build process
- [ ] Kiểm tra environment variables
- [ ] Kiểm tra database connection

### Nếu Frontend không deploy:

- [ ] Kiểm tra build output
- [ ] Kiểm tra Static Web App settings
- [ ] Kiểm tra environment variables
- [ ] Kiểm tra CORS settings
- [ ] Kiểm tra API connection

### Nếu Database connection failed:

- [ ] Kiểm tra MySQL server status
- [ ] Kiểm tra firewall rules
- [ ] Kiểm tra credentials
- [ ] Kiểm tra network connectivity
- [ ] Kiểm tra App Service settings

---

## 📊 Performance Checklist

### Backend Optimization

- [ ] JVM memory settings phù hợp
- [ ] Database connection pool tối ưu
- [ ] Caching được enable
- [ ] Logging level phù hợp (production)
- [ ] Application Insights monitoring

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

### VS Code Integration

- [ ] Azure Explorer hiển thị đầy đủ resources
- [ ] Deploy commands hoạt động
- [ ] Debugging hoạt động
- [ ] Logs streaming hoạt động
- [ ] Resource management hoạt động

---

## 🚨 Emergency Contacts

### VS Code Support

- **Documentation**: https://code.visualstudio.com/docs
- **Azure Extension**: https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice
- **Community**: https://github.com/Microsoft/vscode

### Azure Support

- **Documentation**: https://docs.microsoft.com/azure
- **Community**: https://docs.microsoft.com/answers
- **Status**: https://status.azure.com
- **Support**: Azure Portal → Help + Support

### Project Support

- **GitHub Issues**: Tạo issue trong repository
- **VS Code Logs**: Help → Toggle Developer Tools → Console
- **Azure Logs**: Azure Explorer → App Service → Logs

---

## 📝 Notes

### Deployment URLs

- **Frontend**: https://eventsphere-frontend.azurestaticapps.net
- **Backend**: https://eventsphere-backend.azurewebsites.net
- **API Docs**: https://eventsphere-backend.azurewebsites.net/swagger-ui.html
- **Health Check**: https://eventsphere-backend.azurewebsites.net/actuator/health

### Important Files

- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Build and deploy tasks
- `.vscode/settings.json` - VS Code settings
- `.vscode/azure.json` - Azure configuration
- `env.example` - Environment variables template
- `VSCODE_DEPLOYMENT_GUIDE.md` - Detailed guide
- `vscode-checklist.md` - This checklist

### VS Code Commands

- **Deploy Backend**: `Ctrl+Shift+P` → "Azure App Service: Deploy to Web App"
- **Deploy Frontend**: `Ctrl+Shift+P` → "Azure Static Web Apps: Deploy to Static Web App"
- **View Logs**: `Ctrl+Shift+P` → "Azure App Service: Start Streaming Logs"
- **Open Azure Portal**: `Ctrl+Shift+P` → "Azure: Open in Portal"

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

### Production Scaling

- **Static Web Apps**: Standard tier ($9/month)
- **App Service**: B1 tier ($13/month)
- **MySQL**: General Purpose ($25/month)

### VS Code Benefits

- **No additional cost**: VS Code và extensions miễn phí
- **Integrated workflow**: Giảm thời gian development
- **Visual management**: Dễ quản lý resources
- **Team collaboration**: Shared settings

---

**🎉 Chúc mừng! Nếu tất cả items đã được check, EventSphere đã sẵn sàng production với VS Code deployment!**
