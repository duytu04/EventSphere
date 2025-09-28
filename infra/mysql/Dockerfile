FROM mysql:8.0

# Cài đặt curl cho health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy cấu hình MySQL
COPY my.cnf /etc/mysql/conf.d/custom.cnf

# Tạo thư mục cho data persistence
RUN mkdir -p /var/lib/mysql /var/log/mysql
RUN chown -R mysql:mysql /var/lib/mysql /var/log/mysql

# Copy init script nếu cần
# COPY init.sql /docker-entrypoint-initdb.d/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} || exit 1

# Expose port
EXPOSE 3306

# MySQL sẽ tự động khởi tạo database và user từ environment variables
