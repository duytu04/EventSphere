


// package com.eventsphere.events.service;

// import com.eventsphere.core.exception.NotFoundException;
// import com.eventsphere.events.dto.*;
// import com.eventsphere.events.model.ApprovalStatus;
// // import com.eventsphere.events.model.Category; // ❌ entity đang dùng String category
// import com.eventsphere.events.model.Event;
// import com.eventsphere.events.repo.EventRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.*;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.server.ResponseStatusException;

// import java.util.Objects;

// @Service
// @RequiredArgsConstructor
// public class EventServiceImpl implements EventService {
//   private final EventRepository repo;

//   @Override
//   @Transactional
//   public Event create(EventCreateRequest req, Long organizerId) {
//     // FE -> Entity: name→title, location→venue, capacity→totalSeats
//     String cat = (req.category() != null && !req.category().isBlank())
//         ? req.category().trim()
//         : "GENERAL";

//     int cap = Math.max(0, req.capacity() == null ? 0 : req.capacity());

//     Event e = Event.builder()
//         .title(req.name() != null ? req.name().trim() : null)
//         .description(req.description())
//         .mainImageUrl(req.mainImageUrl())   // ảnh: giữ nguyên như bạn đang gọi
//         .category(cat)                      // dùng String cho khớp entity
//         .venue(req.location())
//         .startTime(req.startTime())
//         .endTime(req.endTime())
//         .totalSeats(cap)
//         .seatsAvail(cap)                    // mặc định: còn chỗ = tổng chỗ
//         .status(ApprovalStatus.PENDING_APPROVAL.name())
//         .organizerId(organizerId)
//         .build();
//     return repo.save(e);
//   }

//   @Override
//   @Transactional
//   public Event update(Long id, EventUpdateRequest req) {
//     Event e = repo.findById(id)
//         .orElseThrow(() -> new NotFoundException("Event not found: " + id));

//     // Optimistic locking (tránh NPE khi req.version() null)
//     if (!Objects.equals(e.getVersion(), req.version())) {
//       throw new ResponseStatusException(HttpStatus.CONFLICT, "Version mismatch");
//     }

//     // giữ đúng hành vi hiện tại: gán trực tiếp, có thể set null nếu req.* null
//     e.setTitle(req.title() != null ? req.title().trim() : null);
//     e.setDescription(req.description());
//     e.setMainImageUrl(req.mainImageUrl());
//     e.setCategory(req.category());   // String
//     e.setVenue(req.venue());
//     e.setStartTime(req.startTime());
//     e.setEndTime(req.endTime());

//     // seatsAvail sau update luôn trong [0, totalSeats]
//     int consumed = Math.max(0, e.getTotalSeats() - e.getSeatsAvail()); // ghế đã dùng
//     int newTotal = Math.max(0, req.totalSeats() == null ? 0 : req.totalSeats());
//     e.setTotalSeats(newTotal);
//     int newAvail = Math.max(0, newTotal - consumed);
//     if (newAvail > newTotal) newAvail = newTotal;
//     e.setSeatsAvail(newAvail);

//     return e; // @Transactional => flush cuối tx
//   }

//   @Override
//   @Transactional
//   public void delete(Long id) {
//     if (!repo.existsById(id)) throw new NotFoundException("Event not found: " + id);
//     repo.deleteById(id);
//   }

//   @Override
//   @Transactional
//   public void submitForApproval(Long id, Long organizerId) {
//     Event e = repo.findById(id)
//         .orElseThrow(() -> new NotFoundException("Event not found: " + id));
//     if (organizerId != null && e.getOrganizerId() != null && !organizerId.equals(e.getOrganizerId())) {
//       throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
//     }
//     e.setStatus(ApprovalStatus.PENDING_APPROVAL.name());
//   }

//   @Override
//   @Transactional
//   public void approve(Long id) {
//     Event e = repo.findById(id)
//         .orElseThrow(() -> new NotFoundException("Event not found: " + id));
//     e.setStatus(ApprovalStatus.APPROVED.name());
//   }

//   @Override
//   @Transactional
//   public void reject(Long id) {
//     Event e = repo.findById(id)
//         .orElseThrow(() -> new NotFoundException("Event not found: " + id));
//     e.setStatus(ApprovalStatus.REJECTED.name());
//   }

//   @Override
//   @Transactional(readOnly = true)
//   public Page<Event> search(String q, String status, int page, int size) {
//     Pageable pageable = PageRequest.of(
//         Math.max(0, page),
//         Math.min(Math.max(1, size), 100),
//         Sort.by("startTime").descending()
//     );

//     String kw = (q == null || q.isBlank()) ? null : q.trim();
//     String st = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();

//     return repo.search(kw, st, pageable);
//   }

//   @Override
//   @Transactional(readOnly = true)
//   public Event get(Long id) {
//     return repo.findById(id)
//         .orElseThrow(() -> new NotFoundException("Event not found: " + id));
//   }

//   @Override
//   @Transactional(readOnly = true)
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
import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventCreateRequest;
import com.eventsphere.events.dto.EventStatsResponse;
import com.eventsphere.events.dto.EventUpdateRequest;
import com.eventsphere.events.model.ApprovalStatus;
// import com.eventsphere.events.model.Category; // ❌ entity đang dùng String category
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
  private final EventRepository repo;

  // =========================
  // 2.1 create(...) – clamp hợp lệ, giữ field cũ
  // =========================
  @Override
@Transactional
public Event create(EventCreateRequest req, Long organizerId) {
  String cat = (req.category() != null && !req.category().isBlank())
      ? req.category().trim() : "GENERAL";

  // DÙNG LẠI FIELD CŨ TỪ DTO: totalSeats, seatsAvail
  int cap   = Math.max(0, req.totalSeats() == null ? 0 : req.totalSeats());
  int avail = (req.seatsAvail() != null) ? Math.max(0, req.seatsAvail()) : cap;
  avail = Math.min(avail, cap);

  Event e = Event.builder()
      .title(req.title() != null ? req.title().trim() : null)
      .description(req.description())
      .mainImageUrl(req.mainImageUrl())
      .category(cat)
      .venue(req.venue())
      .startTime(req.startTime())
      .endTime(req.endTime())
      .totalSeats(cap)
      .seatsAvail(avail)
      .status(ApprovalStatus.PENDING_APPROVAL.name())
      .organizerId(organizerId)
      .build();

  return repo.save(e);
}


  // =========================
  // 2.2 update(...) – tránh == null trên primitive + clamp hợp lệ
  // =========================
@Override
@Transactional
public Event update(Long id, EventUpdateRequest req) {
  Event e = repo.findById(id)
      .orElseThrow(() -> new NotFoundException("Event not found: " + id));

  if (!java.util.Objects.equals(e.getVersion(), req.version())) {
    throw new org.springframework.web.server.ResponseStatusException(
        org.springframework.http.HttpStatus.CONFLICT, "Version mismatch");
  }

  if (req.title() != null)        e.setTitle(req.title().trim());
  if (req.description() != null)  e.setDescription(req.description());
  if (req.mainImageUrl() != null) e.setMainImageUrl(req.mainImageUrl());
  if (req.category() != null)     e.setCategory(req.category());
  if (req.venue() != null)        e.setVenue(req.venue());
  if (req.startTime() != null)    e.setStartTime(req.startTime());
  if (req.endTime() != null)      e.setEndTime(req.endTime());

  // Clamp totalSeats/seatsAvail an toàn (KHÔNG gọi req.seatsAvail())
  int curTotal = e.getTotalSeats() != null ? e.getTotalSeats() : 0;
  int curAvail = e.getSeatsAvail()  != null ? e.getSeatsAvail()  : curTotal;
  int consumed = Math.max(0, curTotal - curAvail);

  int newTotal = (req.totalSeats() != null) ? Math.max(0, req.totalSeats()) : curTotal;
  int newAvail = Math.max(0, newTotal - consumed);
  if (newAvail > newTotal) newAvail = newTotal;

  e.setTotalSeats(newTotal);
  e.setSeatsAvail(newAvail);

  return e;
}


  @Override
  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new NotFoundException("Event not found: " + id);
    repo.deleteById(id);
  }

  @Override
  @Transactional
  public void submitForApproval(Long id, Long organizerId) {
    Event e = repo.findById(id)
        .orElseThrow(() -> new NotFoundException("Event not found: " + id));
    if (organizerId != null && e.getOrganizerId() != null && !organizerId.equals(e.getOrganizerId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
    }
    e.setStatus(ApprovalStatus.PENDING_APPROVAL.name());
  }
  // EventServiceImpl.java
@Override
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public Event getAdminEventById(Long id) {
  return repo.findById(id)
      .orElseThrow(() -> new NotFoundException("Event not found: " + id));
}


  @Override
  @Transactional
  public void approve(Long id) {
    Event e = repo.findById(id)
        .orElseThrow(() -> new NotFoundException("Event not found: " + id));
    e.setStatus(ApprovalStatus.APPROVED.name());
  }

  @Override
  @Transactional
  public void reject(Long id) {
    Event e = repo.findById(id)
        .orElseThrow(() -> new NotFoundException("Event not found: " + id));
    e.setStatus(ApprovalStatus.REJECTED.name());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Event> search(String q, String status, int page, int size) {
    Pageable pageable = PageRequest.of(
        Math.max(0, page),
        Math.min(Math.max(1, size), 100),
        Sort.by("startTime").descending()
    );

    String kw = (q == null || q.isBlank()) ? null : q.trim();
    String st = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();

    return repo.search(kw, st, pageable);
  }

  @Override
  @Transactional(readOnly = true)
  public Event get(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new NotFoundException("Event not found: " + id));
  }

  @Override
  @Transactional(readOnly = true)
  public EventStatsResponse stats() {
    long total = repo.count();
    long approved = repo.countByStatus(ApprovalStatus.APPROVED.name());
    long pending = repo.countByStatus(ApprovalStatus.PENDING_APPROVAL.name());
    long rejected = repo.countByStatus(ApprovalStatus.REJECTED.name());
    return new EventStatsResponse(total, approved, pending, rejected);
  }
}
