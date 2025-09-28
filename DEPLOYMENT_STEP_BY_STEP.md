# 🚀 Hướng dẫn Deploy EventSphere lên Render - Chi tiết từng bước

## 📋 Tổng quan
- **Backend**: Spring Boot + Java 23 (Docker)
- **Frontend**: React + Vite (Static Site)  
- **Database**: MySQL 8.0 (Private Service + Render Disk)
- **Platform**: Render.com
- **Region**: Singapore

---

## 🔧 BƯỚC 1: Chuẩn bị môi trường

### 1.1 Kiểm tra yêu cầu
- ✅ Tài khoản GitHub
- ✅ Tài khoản Render.com
- ✅ Code đã được push lên GitHub repository

### 1.2 Cấu hình Environment Variables

**Tạo file `.env` từ template:**
```bash
# Trong thư mục gốc của project
cp .env.example .env
```

**Chỉnh sửa file `.env` với thông tin thực tế:**
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=MySecureRootPassword123!
MYSQL_PASSWORD=MySecureDBPassword456!

# JWT Configuration (tối thiểu 32 ký tự)
JWT_SECRET=my-super-secret-jwt-key-for-eventsphere-2024-production

# Email Configuration (tùy chọn)
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@eventsphere.com
```

**⚠️ Lưu ý quan trọng:**
- Mật khẩu phải mạnh (ít nhất 12 ký tự)
- JWT_SECRET phải tối thiểu 32 ký tự
- Không commit file `.env` lên GitHub

---

## 🌐 BƯỚC 2: Tạo tài khoản và kết nối Render

### 2.1 Đăng ký Render
1. Truy cập [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Chọn **"Sign up with GitHub"**
4. Authorize Render truy cập GitHub repositories

### 2.2 Kết nối Repository
1. Trong Render Dashboard, click **"New +"**
2. Chọn **"Blueprint"**
3. Chọn repository chứa EventSphere
4. Render sẽ tự động detect file `render.yaml`

---

## ⚙️ BƯỚC 3: Deploy Infrastructure

### 3.1 Tạo Blueprint
1. **Repository**: Chọn repository EventSphere
2. **Branch**: `main` (hoặc branch chính)
3. **Root Directory**: `/` (để trống)
4. **Name**: `EventSphere-Infrastructure`
5. Click **"Apply"**

### 3.2 Render sẽ tự động tạo 3 services:

#### 🗄️ MySQL Database Service
- **Type**: Private Service
- **Name**: `eventsphere-mysql`
- **Status**: Đang tạo...

#### 🖥️ Backend Service  
- **Type**: Web Service
- **Name**: `eventsphere-backend`
- **Status**: Đang tạo...

#### 🌐 Frontend Service
- **Type**: Static Site
- **Name**: `eventsphere-frontend`  
- **Status**: Đang tạo...

---

## 🔐 BƯỚC 4: Cấu hình Environment Variables

### 4.1 Cấu hình Backend Service

**Truy cập Backend Service:**
1. Click vào service `eventsphere-backend`
2. Vào tab **"Environment"**
3. Thêm các biến môi trường:

```env
SPRING_PROFILES_ACTIVE=production
JWT_SECRET=my-super-secret-jwt-key-for-eventsphere-2024-production
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@eventsphere.com
```

**Lưu ý:**
- `DB_HOST`, `DB_PORT`, `DB_PASSWORD` sẽ tự động được set từ MySQL service
- Không cần thêm các biến database

### 4.2 Cấu hình Frontend Service

**Truy cập Frontend Service:**
1. Click vào service `eventsphere-frontend`
2. Vào tab **"Environment"**
3. Thêm các biến môi trường:

```env
VITE_API_BASE_URL=https://eventsphere-backend.onrender.com
VITE_WS_URL=wss://eventsphere-backend.onrender.com/ws
```

### 4.3 Cấu hình MySQL Service

**Truy cập MySQL Service:**
1. Click vào service `eventsphere-mysql`
2. Vào tab **"Environment"**
3. Thêm các biến môi trường:

```env
MYSQL_ROOT_PASSWORD=MySecureRootPassword123!
MYSQL_PASSWORD=MySecureDBPassword456!
MYSQL_DATABASE=eventsphere
MYSQL_USER=eventsphere_user
```

---

## 🚀 BƯỚC 5: Deploy và Kiểm tra

### 5.1 Deploy Services

**Thứ tự deploy:**
1. **MySQL** → Chờ hoàn thành (2-3 phút)
2. **Backend** → Chờ hoàn thành (5-10 phút)  
3. **Frontend** → Chờ hoàn thành (2-3 phút)

**Cách deploy:**
- Click **"Manual Deploy"** cho từng service
- Hoặc đợi auto-deploy khi push code mới

### 5.2 Kiểm tra Deployment

#### ✅ Kiểm tra MySQL
```bash
# Trong MySQL service logs
# Tìm dòng: "ready for connections"
```

#### ✅ Kiểm tra Backend
1. **URL**: `https://eventsphere-backend.onrender.com`
2. **Health Check**: `https://eventsphere-backend.onrender.com/actuator/health`
3. **API Docs**: `https://eventsphere-backend.onrender.com/swagger-ui.html`

**Response mong đợi:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    }
  }
}
```

#### ✅ Kiểm tra Frontend
1. **URL**: `https://eventsphere-frontend.onrender.com`
2. Kiểm tra trang chủ load được
3. Kiểm tra kết nối API (F12 → Network tab)

---

## 🔍 BƯỚC 6: Troubleshooting

### 6.1 Lỗi thường gặp

#### ❌ Backend không start được
**Nguyên nhân:**
- Database chưa sẵn sàng
- Environment variables sai
- Port conflict

**Giải pháp:**
1. Kiểm tra logs trong Render Dashboard
2. Đảm bảo MySQL service đã running
3. Kiểm tra environment variables

#### ❌ Frontend không kết nối được API
**Nguyên nhân:**
- CORS configuration
- Backend chưa ready
- URL sai

**Giải pháp:**
1. Kiểm tra `VITE_API_BASE_URL`
2. Kiểm tra backend logs
3. Test API trực tiếp

#### ❌ Database connection failed
**Nguyên nhân:**
- MySQL service chưa start
- Credentials sai
- Network issue

**Giải pháp:**
1. Restart MySQL service
2. Kiểm tra environment variables
3. Kiểm tra logs

### 6.2 Debug Commands

**Xem logs:**
```bash
# Trong Render Dashboard
# Click vào service → Logs tab
```

**Test API:**
```bash
curl https://eventsphere-backend.onrender.com/actuator/health
```

**Test Database:**
```bash
# Trong MySQL service logs
# Tìm connection logs
```

---

## 📊 BƯỚC 7: Monitoring và Maintenance

### 7.1 Monitoring
- **Render Dashboard**: Theo dõi logs, metrics
- **Health Checks**: Tự động restart nếu fail
- **Alerts**: Có thể setup email alerts

### 7.2 Backup
- **Database**: Render Disk tự động backup
- **Code**: GitHub repository
- **Config**: Lưu trong repository

### 7.3 Scaling
- **Upgrade Plan**: Khi cần thêm resources
- **Auto-scaling**: Render tự động scale
- **Load Balancing**: Tự động distribute traffic

---

## 💰 Chi phí

### Starter Plan (Free tier có giới hạn)
- **Web Service**: $7/tháng
- **Private Service**: $7/tháng  
- **Static Site**: Free
- **Render Disk**: $1/tháng (10GB)
- **Tổng**: ~$15/tháng

### Production Plan
- **Web Service**: $25/tháng
- **Private Service**: $25/tháng
- **Static Site**: $7/tháng
- **Render Disk**: $1/tháng
- **Tổng**: ~$58/tháng

---

## 🎯 BƯỚC 8: Post-Deployment

### 8.1 Custom Domain (Optional)
1. Mua domain từ provider
2. Trong Static Site settings → Custom Domain
3. Cấu hình DNS records
4. SSL certificate tự động

### 8.2 Performance Optimization
1. **CDN**: Render tự động cung cấp
2. **Caching**: Cấu hình cache headers
3. **Compression**: Tự động enable
4. **Minification**: Vite đã cấu hình

### 8.3 Security
1. **HTTPS**: Tự động enable
2. **Environment Variables**: Không expose
3. **Database**: Private network
4. **CORS**: Đã cấu hình

---

## 🆘 Support và Help

### Render Support
- **Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

### Project Support
- **GitHub Issues**: Tạo issue trong repository
- **Logs**: Kiểm tra trong Render Dashboard
- **Health Checks**: Monitor tự động

---

## ✅ Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] File `.env` đã cấu hình
- [ ] Tài khoản Render đã tạo
- [ ] Blueprint đã tạo
- [ ] Environment variables đã set
- [ ] MySQL service running
- [ ] Backend service running
- [ ] Frontend service running
- [ ] Health checks pass
- [ ] API connection working
- [ ] Database connection working

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:
- ✅ Backend API chạy trên `https://eventsphere-backend.onrender.com`
- ✅ Frontend app chạy trên `https://eventsphere-frontend.onrender.com`
- ✅ MySQL database với persistent storage
- ✅ SSL certificates tự động
- ✅ Monitoring và health checks
- ✅ Auto-deployment từ GitHub

**Chúc mừng! EventSphere đã được deploy thành công lên Render! 🚀**
