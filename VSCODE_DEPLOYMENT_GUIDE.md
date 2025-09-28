# 🚀 Hướng dẫn Deploy EventSphere từ VS Code

## 📋 Tổng quan

Deploy EventSphere trực tiếp từ VS Code sử dụng Azure Tools Extension - cách đơn giản và trực quan nhất.

### 🎯 Lợi ích:

- ✅ Deploy trực tiếp từ VS Code
- ✅ Không cần command line phức tạp
- ✅ Visual interface dễ sử dụng
- ✅ Debug và deploy trong cùng môi trường
- ✅ Quản lý Azure resources trực tiếp

---

## 🔧 BƯỚC 1: Cài đặt Extensions

### 1.1 Cài đặt Azure Tools Extension Pack

1. Mở VS Code
2. Vào **Extensions** (Ctrl+Shift+X)
3. Tìm kiếm: **"Azure Tools"**
4. Cài đặt **"Azure Tools"** extension pack

### 1.2 Extensions cần thiết:

- **Azure App Service** - Deploy backend
- **Azure Static Web Apps** - Deploy frontend
- **Azure Resource Groups** - Quản lý resources
- **Azure Storage** - Quản lý storage
- **Docker** - Container management
- **Java Extension Pack** - Backend development
- **ES7+ React/Redux/React-Native snippets** - Frontend development

### 1.3 Extensions đã được cấu hình sẵn

File `.vscode/extensions.json` đã được tạo với danh sách extensions khuyến nghị.

---

## 🔐 BƯỚC 2: Đăng nhập Azure

### 2.1 Đăng nhập Azure Account

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure: Sign In"**
3. Chọn **"Sign In"**
4. Đăng nhập bằng Azure account

### 2.2 Chọn Subscription

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure: Select Subscription"**
3. Chọn subscription phù hợp

### 2.3 Cấu hình Azure Settings

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Preferences: Open Settings (JSON)"**
3. Cập nhật Azure settings trong `.vscode/settings.json`:

```json
{
  "azure.tenantId": "your-tenant-id",
  "azure.subscriptionId": "your-subscription-id",
  "azure.resourceGroup": "eventsphere-rg",
  "azure.location": "East US 2"
}
```

---

## ⚙️ BƯỚC 3: Cấu hình Environment

### 3.1 Tạo file Environment Variables

```bash
# Copy template
cp env.example .env

# Chỉnh sửa với thông tin thực tế
```

### 3.2 Cập nhật .env file

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventsphere
DB_USERNAME=root
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=6868
SPRING_PROFILES_ACTIVE=dev

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:6868
VITE_WS_URL=ws://localhost:6868/ws
```

---

## 🗄️ BƯỚC 4: Tạo Azure Resources

### 4.1 Tạo Resource Group

1. Mở **Azure Explorer** (Ctrl+Shift+A)
2. Right-click **"Resource Groups"**
3. Chọn **"Create Resource Group"**
4. Nhập tên: `eventsphere-rg`
5. Chọn location: **"East US 2"**

### 4.2 Tạo MySQL Database

1. Trong **Azure Explorer**
2. Right-click **"Resource Groups" > "eventsphere-rg"**
3. Chọn **"Create Resource"**
4. Tìm kiếm: **"Azure Database for MySQL"**
5. Chọn **"Flexible Server"**
6. Cấu hình:
   - **Server name**: `eventsphere-mysql`
   - **Admin username**: `eventsphereadmin`
   - **Password**: `your-secure-password`
   - **Pricing tier**: `Standard_B1ms`

### 4.3 Tạo App Service Plan

1. Trong **Azure Explorer**
2. Right-click **"Resource Groups" > "eventsphere-rg"**
3. Chọn **"Create Resource"**
4. Tìm kiếm: **"App Service Plan"**
5. Cấu hình:
   - **Name**: `eventsphere-plan`
   - **Pricing tier**: `B1`
   - **Operating System**: `Linux`

---

## 🖥️ BƯỚC 5: Deploy Backend (App Service)

### 5.1 Tạo Web App

1. Trong **Azure Explorer**
2. Right-click **"App Service"**
3. Chọn **"Create New Web App"**
4. Cấu hình:
   - **Name**: `eventsphere-backend`
   - **Resource Group**: `eventsphere-rg`
   - **Runtime Stack**: `Java 11`
   - **Operating System**: `Linux`
   - **Pricing Tier**: `B1`

### 5.2 Deploy Backend Code

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure App Service: Deploy to Web App"**
3. Chọn **"eventsphere-backend"**
4. Chọn **"Browse"** và chọn thư mục `backend`
5. Chọn **"Deploy"**

### 5.3 Cấu hình Environment Variables

1. Trong **Azure Explorer**
2. Mở **"App Service" > "eventsphere-backend"**
3. Right-click **"Application Settings"**
4. Thêm các biến môi trường:

```env
SPRING_PROFILES_ACTIVE=production
DB_HOST=eventsphere-mysql.mysql.database.azure.com
DB_PORT=3306
DB_NAME=eventsphere
DB_USERNAME=eventsphereadmin
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
CORS_ALLOWED_ORIGINS=https://eventsphere-frontend.azurestaticapps.net
```

---

## 🌐 BƯỚC 6: Deploy Frontend (Static Web App)

### 6.1 Tạo Static Web App

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure Static Web Apps: Create Static Web App"**
3. Cấu hình:
   - **Name**: `eventsphere-frontend`
   - **Resource Group**: `eventsphere-rg`
   - **Location**: `East US 2`
   - **Source**: `Local`
   - **App Location**: `frontend`
   - **Output Location**: `dist`
   - **Build Command**: `npm ci && npm run build`

### 6.2 Cấu hình Environment Variables

1. Trong **Azure Explorer**
2. Mở **"Static Web Apps" > "eventsphere-frontend"**
3. Right-click **"Application Settings"**
4. Thêm các biến môi trường:

```env
VITE_API_BASE_URL=https://eventsphere-backend.azurewebsites.net
VITE_WS_URL=wss://eventsphere-backend.azurewebsites.net/ws
```

---

## 🔧 BƯỚC 7: Cấu hình Database

### 7.1 Tạo Database

1. Trong **Azure Explorer**
2. Mở **"MySQL" > "eventsphere-mysql"**
3. Right-click **"Databases"**
4. Chọn **"Create Database"**
5. Nhập tên: `eventsphere`

### 7.2 Cấu hình Firewall

1. Trong **Azure Explorer**
2. Mở **"MySQL" > "eventsphere-mysql"**
3. Right-click **"Firewall Rules"**
4. Chọn **"Add Firewall Rule"**
5. Cấu hình:
   - **Rule Name**: `AllowAzureServices`
   - **Start IP**: `0.0.0.0`
   - **End IP**: `0.0.0.0`

---

## 🚀 BƯỚC 8: Deploy và Test

### 8.1 Deploy Backend

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure App Service: Deploy to Web App"**
3. Chọn **"eventsphere-backend"**
4. Chọn thư mục `backend`
5. Chọn **"Deploy"**

### 8.2 Deploy Frontend

1. Mở **Command Palette** (Ctrl+Shift+P)
2. Gõ: **"Azure Static Web Apps: Deploy to Static Web App"**
3. Chọn **"eventsphere-frontend"**
4. Chọn thư mục `frontend`
5. Chọn **"Deploy"**

### 8.3 Test Deployment

1. **Backend**: `https://eventsphere-backend.azurewebsites.net`
2. **Frontend**: `https://eventsphere-frontend.azurestaticapps.net`
3. **API Health**: `https://eventsphere-backend.azurewebsites.net/actuator/health`

---

## 🔄 BƯỚC 9: Development Workflow

### 9.1 Local Development

1. **Start Backend**: `Ctrl+Shift+P` → **"Tasks: Run Task"** → **"Start Backend Dev Server"**
2. **Start Frontend**: `Ctrl+Shift+P` → **"Tasks: Run Task"** → **"Start Frontend Dev Server"**

### 9.2 Debug Backend

1. Mở file Java trong `backend/src`
2. Set breakpoint
3. Press **F5** hoặc chọn **"Launch EventSphere Backend"**

### 9.3 Deploy Changes

1. **Build**: `Ctrl+Shift+P` → **"Tasks: Run Task"** → **"Build Backend"**
2. **Deploy**: `Ctrl+Shift+P` → **"Azure App Service: Deploy to Web App"**

---

## 📊 BƯỚC 10: Monitoring và Management

### 10.1 View Logs

1. Trong **Azure Explorer**
2. Mở **"App Service" > "eventsphere-backend"**
3. Right-click **"Logs"**
4. Chọn **"Start Streaming Logs"**

### 10.2 Monitor Performance

1. Trong **Azure Explorer**
2. Mở **"App Service" > "eventsphere-backend"**
3. Right-click **"Application Insights"**
4. Chọn **"Open in Portal"**

### 10.3 Manage Resources

1. Trong **Azure Explorer**
2. Right-click bất kỳ resource nào
3. Chọn action phù hợp (Start, Stop, Restart, Delete, etc.)

---

## 🔧 BƯỚC 11: Troubleshooting

### 11.1 Lỗi thường gặp

#### ❌ Deploy failed

- Kiểm tra logs trong **Azure Explorer**
- Kiểm tra environment variables
- Kiểm tra build process

#### ❌ Database connection failed

- Kiểm tra firewall rules
- Kiểm tra credentials
- Kiểm tra network connectivity

#### ❌ Frontend không load

- Kiểm tra build output
- Kiểm tra environment variables
- Kiểm tra CORS settings

### 11.2 Debug Commands

```bash
# Xem logs App Service
az webapp log tail --name eventsphere-backend --resource-group eventsphere-rg

# Xem logs Static Web App
az staticwebapp logs --name eventsphere-frontend --resource-group eventsphere-rg

# Kiểm tra App Service settings
az webapp config appsettings list --name eventsphere-backend --resource-group eventsphere-rg
```

---

## ✅ Checklist Deploy

- [ ] Azure Tools Extension đã cài đặt
- [ ] Đã đăng nhập Azure account
- [ ] Resource Group đã tạo
- [ ] MySQL Database đã tạo và cấu hình
- [ ] App Service Plan đã tạo
- [ ] Backend Web App đã tạo và deploy
- [ ] Frontend Static Web App đã tạo và deploy
- [ ] Environment variables đã cấu hình
- [ ] Database connection hoạt động
- [ ] Frontend kết nối được API
- [ ] Health checks pass

---

## 🎯 Lợi ích VS Code Deployment

### 1. **Visual Interface**

- Quản lý Azure resources trực quan
- Deploy bằng click chuột
- Monitor logs real-time

### 2. **Integrated Development**

- Code, debug, deploy trong cùng môi trường
- IntelliSense cho Azure resources
- Integrated terminal

### 3. **Easy Management**

- Quản lý multiple environments
- Rollback deployments
- Monitor performance

### 4. **Team Collaboration**

- Shared VS Code settings
- Consistent development environment
- Easy onboarding

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước trên, bạn sẽ có:

- ✅ EventSphere chạy trên Azure
- ✅ Backend trên App Service
- ✅ Frontend trên Static Web App
- ✅ Database trên MySQL Flexible Server
- ✅ Deploy trực tiếp từ VS Code
- ✅ Monitoring và management tools

**Chúc mừng! EventSphere đã được deploy thành công từ VS Code! 🚀**
