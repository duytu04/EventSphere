# Multi-stage build để tối ưu kích thước image
FROM eclipse-temurin:23-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:23-jre
WORKDIR /app

# Tạo user non-root để bảo mật
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy JAR file từ builder stage
COPY --from=builder /app/target/*.jar app.jar

# Thay đổi ownership
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:6868/actuator/health || exit 1

EXPOSE 6868

# JVM tuning cho production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
