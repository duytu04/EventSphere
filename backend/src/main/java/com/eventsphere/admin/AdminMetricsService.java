package com.eventsphere.admin;

import com.eventsphere.admin.dto.AdminMetricsResponse;
import com.eventsphere.admin.dto.AdminMetricsResponse.CapacityHotspot;
import com.eventsphere.admin.dto.AdminMetricsResponse.Kpis;
import com.eventsphere.admin.dto.AdminMetricsResponse.PendingEventSummary;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import com.eventsphere.users.model.User;
import com.eventsphere.users.repo.UserRepository;
import com.eventsphere.users.repo.UserRepository.RoleCount;
import com.eventsphere.registrations.model.Registration;
import com.eventsphere.registrations.repo.RegistrationRepository;
import com.eventsphere.admin.repo.AdminNotificationRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminMetricsService {

  private static final List<String> KNOWN_ROLES = List.of("ADMIN", "ORGANIZER", "USER");
  private static final List<String> KNOWN_STATUSES = List.of("APPROVED", "PENDING_APPROVAL", "REJECTED", "DRAFT");
  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

  private final UserRepository userRepo;
  private final EventRepository eventRepo;
  private final RegistrationRepository registrationRepo;
  private final AdminNotificationRepository notificationRepo;

  public AdminMetricsService(UserRepository userRepo, EventRepository eventRepo, RegistrationRepository registrationRepo, AdminNotificationRepository notificationRepo) {
    this.userRepo = userRepo;
    this.eventRepo = eventRepo;
    this.registrationRepo = registrationRepo;
    this.notificationRepo = notificationRepo;
  }

  public AdminMetricsResponse snapshot() {
    Kpis kpis = collectKpis();
    List<PendingEventSummary> pending = collectPendingEvents();
    List<AdminMetricsResponse.RecentRegistration> recentRegistrations = collectRecentRegistrations();
    List<CapacityHotspot> hotspots = collectCapacityHotspots();
    AdminMetricsResponse.NotificationStats notificationStats = collectNotificationStats();

    return new AdminMetricsResponse(
        kpis,
        pending,
        recentRegistrations,
        hotspots,
        notificationStats,
        Instant.now()
    );
  }

  private Kpis collectKpis() {
    long usersTotal = userRepo.count();
    Map<String, Long> usersByRole = new LinkedHashMap<>();
    KNOWN_ROLES.forEach(role -> usersByRole.put(role, 0L));
    for (RoleCount rc : userRepo.countUsersByRole()) {
      usersByRole.merge(rc.getRole(), rc.getCount(), Long::sum);
    }

    long eventsTotal = eventRepo.count();
    Map<String, Long> eventsByStatus = new LinkedHashMap<>();
    for (String status : KNOWN_STATUSES) {
      eventsByStatus.put(status, eventRepo.countByStatus(status));
    }

    List<Event> allEvents = eventRepo.findAll();
    long totalCapacity = 0;
    long totalRegistered = 0;
    for (Event e : allEvents) {
      int capacity = nullableToInt(e.getTotalSeats());
      int seatsAvail = nullableToIntOrDefault(e.getSeatsAvail(), capacity);
      int registered = Math.max(0, capacity - seatsAvail);
      totalCapacity += capacity;
      totalRegistered += registered;
    }

    double capacityUtilization = totalCapacity == 0
        ? 0D
        : (double) totalRegistered * 100D / (double) totalCapacity;

    return new Kpis(
        usersTotal,
        Collections.unmodifiableMap(usersByRole),
        eventsTotal,
        Collections.unmodifiableMap(eventsByStatus),
        totalRegistered,
        totalRegistered,
        capacityUtilization
    );
  }

  private List<PendingEventSummary> collectPendingEvents() {
    List<Event> pendingEvents = eventRepo.findTop5ByStatusOrderByStartTimeAsc("PENDING_APPROVAL");

    Set<Long> organizerIds = pendingEvents.stream()
        .map(Event::getOrganizerId)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    Map<Long, User> organizers = organizerIds.isEmpty()
        ? Map.of()
        : userRepo.findAllById(organizerIds).stream()
            .collect(Collectors.toMap(User::getUserId, Function.identity()));

    return pendingEvents.stream()
        .map(event -> new PendingEventSummary(
            event.getEventId(),
            event.getTitle(),
            resolveOrganizerName(event.getOrganizerId(), organizers),
            toInstant(event.getStartTime()),
            nullableToInt(event.getTotalSeats())
        ))
        .toList();
  }

  private String resolveOrganizerName(Long organizerId, Map<Long, User> organizers) {
    if (organizerId == null) return null;
    User user = organizers.get(organizerId);
    if (user == null) return null;
    return user.getFullName() != null && !user.getFullName().isBlank()
        ? user.getFullName()
        : user.getEmail();
  }

  private List<AdminMetricsResponse.RecentRegistration> collectRecentRegistrations() {
    return registrationRepo.findAll().stream()
        .sorted((a, b) -> b.getRegisteredAt().compareTo(a.getRegisteredAt()))
        .limit(5)
        .map(reg -> new AdminMetricsResponse.RecentRegistration(
            reg.getId(),
            reg.getEvent().getEventId(),
            reg.getEvent().getTitle(),
            reg.getUser().getEmail(),
            toInstant(reg.getRegisteredAt())
        ))
        .toList();
  }

  private AdminMetricsResponse.NotificationStats collectNotificationStats() {
    long totalUnread = notificationRepo.countUnreadNotifications();
    long editRequestUnread = notificationRepo.countUnreadEditRequests();
    
    return new AdminMetricsResponse.NotificationStats(
        totalUnread,
        editRequestUnread,
        0L, // approvalRequestUnread - implement later
        0L, // userRegistrationUnread - implement later
        0L  // systemAlertUnread - implement later
    );
  }

  private List<CapacityHotspot> collectCapacityHotspots() {
    return eventRepo.findAll().stream()
        .filter(e -> nullableToInt(e.getTotalSeats()) > 0)
        .filter(e -> !Objects.equals(e.getStatus(), "REJECTED"))
        .sorted((a, b) -> Double.compare(fillRatio(b), fillRatio(a)))
        .limit(5)
        .map(e -> new CapacityHotspot(
            e.getEventId(),
            e.getTitle(),
            nullableToInt(e.getTotalSeats()),
            nullableToIntOrDefault(e.getSeatsAvail(), nullableToInt(e.getTotalSeats()))
        ))
        .toList();
  }

  private double fillRatio(Event event) {
    int capacity = nullableToInt(event.getTotalSeats());
    if (capacity <= 0) return 0D;
    int seatsAvail = nullableToIntOrDefault(event.getSeatsAvail(), capacity);
    int registered = Math.max(0, capacity - seatsAvail);
    return (double) registered / (double) capacity;
  }

  private int nullableToInt(Integer value) {
    return value != null ? value : 0;
  }

  private int nullableToIntOrDefault(Integer value, int fallback) {
    return value != null ? value : fallback;
  }

  private Instant toInstant(LocalDateTime time) {
    return time != null ? time.atZone(DEFAULT_ZONE).toInstant() : null;
  }
}
