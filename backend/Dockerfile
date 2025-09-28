FROM eclipse-temurin:23-jdk
WORKDIR /app
COPY . .
RUN ./mvnw -q -DskipTests package || mvn -q -DskipTests package
EXPOSE 6868
CMD ["bash","-lc","java -jar target/*.jar"]
