# ✅ EventSphere Deploy Checklist

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] Code đã được commit và push lên GitHub
- [ ] File `render.yaml` đã có trong repository
- [ ] File `.env.example` đã được tạo
- [ ] Dockerfile cho backend đã được tối ưu
- [ ] Vite config cho frontend đã được cấu hình

### Environment Setup
- [ ] File `.env` đã được tạo từ `.env.example`
- [ ] Mật khẩu database đã được đặt mạnh
- [ ] JWT secret đã được đặt (tối thiểu 32 ký tự)
- [ ] Email configuration đã được cấu hình (nếu cần)
- [ ] File `.env` đã được thêm vào `.gitignore`

### Account Setup
- [ ] Tài khoản GitHub đã sẵn sàng
- [ ] Tài khoản Render.com đã được tạo
- [ ] GitHub repository đã được kết nối với Render

---

## 🚀 Deployment Checklist

### Step 1: Create Blueprint
- [ ] Đăng nhập vào Render Dashboard
- [ ] Click "New +" → "Blueprint"
- [ ] Chọn repository EventSphere
- [ ] Chọn branch `main`
- [ ] Click "Apply" để tạo blueprint

### Step 2: Configure Services
- [ ] **MySQL Service** đã được tạo
- [ ] **Backend Service** đã được tạo  
- [ ] **Frontend Service** đã được tạo

### Step 3: Environment Variables

#### MySQL Service
- [ ] `MYSQL_ROOT_PASSWORD` = [your-secure-password]
- [ ] `MYSQL_PASSWORD` = [your-secure-password]
- [ ] `MYSQL_DATABASE` = eventsphere
- [ ] `MYSQL_USER` = eventsphere_user

#### Backend Service
- [ ] `SPRING_PROFILES_ACTIVE` = production
- [ ] `JWT_SECRET` = [your-32-char-secret]
- [ ] `MAIL_HOST` = smtp.gmail.com
- [ ] `MAIL_USERNAME` = [your-email]
- [ ] `MAIL_PASSWORD` = [your-app-password]
- [ ] `MAIL_FROM` = noreply@eventsphere.com

#### Frontend Service
- [ ] `VITE_API_BASE_URL` = https://eventsphere-backend.onrender.com
- [ ] `VITE_WS_URL` = wss://eventsphere-backend.onrender.com/ws

---

## ✅ Post-Deployment Checklist

### Service Status
- [ ] **MySQL Service**: Status = "Live"
- [ ] **Backend Service**: Status = "Live"
- [ ] **Frontend Service**: Status = "Live"

### Health Checks
- [ ] Backend health check: `https://eventsphere-backend.onrender.com/actuator/health`
- [ ] Response: `{"status":"UP"}`
- [ ] Database connection: `{"status":"UP","components":{"db":{"status":"UP"}}}`

### Frontend Testing
- [ ] Frontend URL: `https://eventsphere-frontend.onrender.com`
- [ ] Trang chủ load được
- [ ] Không có lỗi console (F12)
- [ ] API calls thành công (Network tab)

### Backend Testing
- [ ] API docs: `https://eventsphere-backend.onrender.com/swagger-ui.html`
- [ ] Test API endpoints
- [ ] Database queries hoạt động
- [ ] Authentication flow hoạt động

### Security Checks
- [ ] HTTPS được enable cho tất cả services
- [ ] Environment variables không bị expose
- [ ] CORS configuration đúng
- [ ] Database chỉ accessible từ backend

---

## 🔧 Troubleshooting Checklist

### Nếu Backend không start:
- [ ] Kiểm tra logs trong Render Dashboard
- [ ] Kiểm tra MySQL service đã running
- [ ] Kiểm tra environment variables
- [ ] Kiểm tra port 6868 có bị conflict không

### Nếu Frontend không kết nối API:
- [ ] Kiểm tra `VITE_API_BASE_URL` đúng
- [ ] Kiểm tra backend service đã running
- [ ] Kiểm tra CORS settings
- [ ] Test API trực tiếp bằng curl

### Nếu Database connection failed:
- [ ] Kiểm tra MySQL service logs
- [ ] Kiểm tra credentials
- [ ] Kiểm tra network connectivity
- [ ] Restart MySQL service nếu cần

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
- [ ] CDN được sử dụng

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

### Render Support
- **Documentation**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

### Project Team
- **GitHub Issues**: Tạo issue trong repository
- **Logs**: Render Dashboard → Service → Logs
- **Monitoring**: Render Dashboard → Metrics

---

## 📝 Notes

### Deployment URLs
- **Frontend**: https://eventsphere-frontend.onrender.com
- **Backend**: https://eventsphere-backend.onrender.com
- **API Docs**: https://eventsphere-backend.onrender.com/swagger-ui.html
- **Health Check**: https://eventsphere-backend.onrender.com/actuator/health

### Important Files
- `render.yaml` - Infrastructure configuration
- `.env` - Environment variables (local)
- `DEPLOYMENT_STEP_BY_STEP.md` - Detailed guide
- `deploy-checklist.md` - This checklist

### Next Steps After Deployment
1. Setup monitoring alerts
2. Configure custom domain (optional)
3. Setup automated backups
4. Performance monitoring
5. Security audit

---

**🎉 Chúc mừng! Nếu tất cả items đã được check, EventSphere đã sẵn sàng production!**
