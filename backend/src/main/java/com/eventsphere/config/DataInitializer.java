package com.eventsphere.config;

import com.eventsphere.security.Role;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.RoleRepository;
import com.eventsphere.users.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🚀 Starting data initialization...");
            
            // Tạo roles nếu chưa có
            if (roleRepository.count() == 0) {
                System.out.println("📝 Creating roles...");
                Role adminRole = new Role();
                adminRole.setRoleName("ADMIN");
                roleRepository.save(adminRole);

                Role organizerRole = new Role();
                organizerRole.setRoleName("ORGANIZER");
                roleRepository.save(organizerRole);

                Role userRole = new Role();
                userRole.setRoleName("USER");
                roleRepository.save(userRole);
                System.out.println("✅ Roles created successfully");
            } else {
                System.out.println("ℹ️ Roles already exist");
            }

            // Tạo admin user nếu chưa có
            if (userRepository.findByEmail("admin@eventsphere.com").isEmpty()) {
                System.out.println("👤 Creating admin user...");
                User admin = new User();
                admin.setEmail("admin@eventsphere.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setEnabled(true);

                // Lấy ADMIN role
                Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
                admin.setRoles(Set.of(adminRole));

                userRepository.save(admin);
                System.out.println("✅ Admin user created: admin@eventsphere.com / admin123");
            } else {
                System.out.println("ℹ️ Admin user already exists");
            }
            
            System.out.println("🎉 Data initialization completed!");
        } catch (Exception e) {
            System.err.println("❌ Error during data initialization: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
