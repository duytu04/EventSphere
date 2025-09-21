



// package com.eventsphere.events.service;

// import com.eventsphere.core.exception.NotFoundException;
// import com.eventsphere.events.dto.*;
// import com.eventsphere.events.model.ApprovalStatus;
// import com.eventsphere.events.model.Category;
// import com.eventsphere.events.model.Event;
// import com.eventsphere.events.repo.EventRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.*;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.server.ResponseStatusException;

// @Service
// @RequiredArgsConstructor
// public class EventServiceImpl implements EventService {
//   private final EventRepository repo;

//   @Override @Transactional
//   public Event create(EventCreateRequest req, Long organizerId) {
//     // FE -> Entity: name→title, location→venue, capacity→totalSeats
//     Category cat = (req.category() != null) ? req.category() : Category.GENERAL;
//     int cap = (req.capacity() != null) ? req.capacity() : 0;

//     Event e = Event.builder()
//         .title(req.name() != null ? req.name().trim() : null)
//         .description(req.description())
//         .mainImageUrl(req.mainImageUrl())         // <-- dùng đúng accessor + đúng builder field
//         .category(cat)                            // <-- enum, không phải String
//         .venue(req.location())
//         .startTime(req.startTime())
//         .endTime(req.endTime())
//         .totalSeats(cap)
//         .seatsAvail(cap)
//         .status(ApprovalStatus.PENDING_APPROVAL.name())
//         .organizerId(organizerId)
//         .build();
//     return repo.save(e);
//   }

//   @Override @Transactional
//   public Event update(Long id, EventUpdateRequest req) {
//     Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
//     if (!e.getVersion().equals(req.version())) {
//       throw new ResponseStatusException(HttpStatus.CONFLICT, "Version mismatch");
//     }

//     e.setTitle(req.title() != null ? req.title().trim() : null);
//     e.setDescription(req.description());
//     e.setMainImageUrl(req.mainImageUrl());       // <-- accessor đúng
//     e.setCategory(req.category());               // enum Category
//     e.setVenue(req.venue());
//     e.setStartTime(req.startTime());
//     e.setEndTime(req.endTime());

//     int consumed = e.getTotalSeats() - e.getSeatsAvail();   // ghế đã sử dụng
//     e.setTotalSeats(req.totalSeats());
//     e.setSeatsAvail(Math.max(0, req.totalSeats() - consumed));
//     return e;
//   }

//   @Override @Transactional
//   public void delete(Long id) {
//     if (!repo.existsById(id)) throw new NotFoundException("Event not found");
//     repo.deleteById(id);
//   }

//   @Override @Transactional
//   public void submitForApproval(Long id, Long organizerId) {
//     Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
//     if (organizerId != null && e.getOrganizerId() != null && !organizerId.equals(e.getOrganizerId())) {
//       throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
//     }
//     e.setStatus(ApprovalStatus.PENDING_APPROVAL.name());
//   }

//   @Override @Transactional public void approve(Long id) {
//     Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
//     e.setStatus(ApprovalStatus.APPROVED.name());
//   }

//   @Override @Transactional public void reject(Long id) {
//     Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
//     e.setStatus(ApprovalStatus.REJECTED.name());
//   }

//   @Override
//   public Page<Event> search(String q, String status, int page, int size) {
//     Pageable pageable = PageRequest.of(Math.max(0, page),
//         Math.min(Math.max(1, size), 100),
//         Sort.by("startTime").descending());
//     return repo.search(
//         (q == null || q.isBlank()) ? null : q.trim(),
//         (status == null || status.isBlank()) ? null : status,
//         pageable);
//   }

//   @Override public Event get(Long id) {
//     return repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
//   }

//   @Override
//   public EventStatsResponse stats() {
//     long total = repo.count();
//     long approved = repo.countByStatus(ApprovalStatus.APPROVED.name());
//     long pending = repo.countByStatus(ApprovalStatus.PENDING_APPROVAL.name());
//     long rejected = repo.countByStatus(ApprovalStatus.REJECTED.name());
//     return new EventStatsResponse(total, approved, pending, rejected);
//   }
// }



package com.eventsphere.events.service;

import com.eventsphere.core.exception.NotFoundException;
import com.eventsphere.events.dto.*;
import com.eventsphere.events.model.ApprovalStatus;
// import com.eventsphere.events.model.Category; // ❌ bỏ vì entity đang dùng String category
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
  private final EventRepository repo;

  @Override @Transactional
  public Event create(EventCreateRequest req, Long organizerId) {
    // FE -> Entity: name→title, location→venue, capacity→totalSeats
    String cat = (req.category() != null && !req.category().isBlank())
        ? req.category().trim()
        : "GENERAL";
    int cap = (req.capacity() != null) ? req.capacity() : 0;

    Event e = Event.builder()
        .title(req.name() != null ? req.name().trim() : null)
        .description(req.description())
        .mainImageUrl(req.mainImageUrl())   // ảnh: giữ nguyên như bạn đang gọi
        .category(cat)                      // dùng String cho khớp entity
        .venue(req.location())
        .startTime(req.startTime())
        .endTime(req.endTime())
        .totalSeats(cap)
        .seatsAvail(cap)
        .status(ApprovalStatus.PENDING_APPROVAL.name())
        .organizerId(organizerId)
        .build();
    return repo.save(e);
  }

  @Override @Transactional
  public Event update(Long id, EventUpdateRequest req) {
    Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    if (!e.getVersion().equals(req.version())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Version mismatch");
    }

    // giữ đúng hành vi hiện tại: gán trực tiếp, có thể set null nếu req.* null
    e.setTitle(req.title() != null ? req.title().trim() : null);
    e.setDescription(req.description());
    e.setMainImageUrl(req.mainImageUrl());
    e.setCategory(req.category());   // String
    e.setVenue(req.venue());
    e.setStartTime(req.startTime());
    e.setEndTime(req.endTime());

    int consumed = e.getTotalSeats() - e.getSeatsAvail();   // ghế đã sử dụng
    e.setTotalSeats(req.totalSeats());
    e.setSeatsAvail(Math.max(0, req.totalSeats() - consumed));
    return e;
  }

  @Override @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new NotFoundException("Event not found");
    repo.deleteById(id);
  }

  @Override @Transactional
  public void submitForApproval(Long id, Long organizerId) {
    Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    if (organizerId != null && e.getOrganizerId() != null && !organizerId.equals(e.getOrganizerId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
    }
    e.setStatus(ApprovalStatus.PENDING_APPROVAL.name());
  }

  @Override @Transactional public void approve(Long id) {
    Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    e.setStatus(ApprovalStatus.APPROVED.name());
  }

  @Override @Transactional public void reject(Long id) {
    Event e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    e.setStatus(ApprovalStatus.REJECTED.name());
  }

  @Override
  public Page<Event> search(String q, String status, int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(0, page),
        Math.min(Math.max(1, size), 100),
        Sort.by("startTime").descending());
    return repo.search(
        (q == null || q.isBlank()) ? null : q.trim(),
        (status == null || status.isBlank()) ? null : status,
        pageable);
  }

  @Override public Event get(Long id) {
    return repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
  }

  @Override
  public EventStatsResponse stats() {
    long total = repo.count();
    long approved = repo.countByStatus(ApprovalStatus.APPROVED.name());
    long pending = repo.countByStatus(ApprovalStatus.PENDING_APPROVAL.name());
    long rejected = repo.countByStatus(ApprovalStatus.REJECTED.name());
    return new EventStatsResponse(total, approved, pending, rejected);
  }
}
