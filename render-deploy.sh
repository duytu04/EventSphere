#!/bin/bash

# Script để deploy EventSphere lên Render
# Chạy script này sau khi đã cấu hình render.yaml

echo "🚀 Bắt đầu deploy EventSphere lên Render..."

# Kiểm tra file render.yaml tồn tại
if [ ! -f "render.yaml" ]; then
    echo "❌ Không tìm thấy file render.yaml"
    exit 1
fi

# Kiểm tra file .env tồn tại
if [ ! -f ".env" ]; then
    echo "⚠️  Không tìm thấy file .env"
    echo "📝 Tạo file .env từ .env.example..."
    cp .env.example .env
    echo "✅ Đã tạo file .env. Vui lòng cập nhật các giá trị trong file này trước khi deploy."
    exit 1
fi

echo "✅ Đã kiểm tra các file cần thiết"

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📋 Thông tin deployment:"
echo "   - Backend: Spring Boot + Java 23"
echo "   - Frontend: React + Vite"
echo "   - Database: MySQL 8.0 với Render Disk"
echo "   - Region: Singapore"

echo ""
echo "🔧 Các bước tiếp theo:"
echo "1. Push code lên GitHub repository"
echo "2. Truy cập https://render.com"
echo "3. Tạo Blueprint từ repository"
echo "4. Cấu hình environment variables trong Render Dashboard"
echo "5. Deploy và kiểm tra"

echo ""
echo "📚 Xem hướng dẫn chi tiết trong file DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Hoàn thành! Chúc bạn deploy thành công!"
