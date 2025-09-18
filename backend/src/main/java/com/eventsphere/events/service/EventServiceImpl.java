package com.eventsphere.events.service;


import com.eventsphere.events.dto.*;
import com.eventsphere.events.model.ApprovalStatus;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.repo.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.eventsphere.core.exception.NotFoundException;

@Service @RequiredArgsConstructor
public class EventServiceImpl implements EventService {
  private final EventRepository repo;

  @Override @Transactional
  public Event create(EventCreateRequest req, Long organizerId){
    var e = Event.builder()
      .title(req.title().trim())
      .description(req.description())
      .category(req.category())
      .venue(req.venue())
      .startTime(req.startTime())
      .endTime(req.endTime())
      .totalSeats(req.totalSeats())
      .seatsAvail(req.totalSeats())
      .status(ApprovalStatus.PENDING_APPROVAL.name())
      .organizerId(organizerId)
      .build();
    return repo.save(e);
  }

  @Override @Transactional
  public Event update(Long id, EventUpdateRequest req){
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    if (!e.getVersion().equals(req.version()))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Version mismatch");
    e.setTitle(req.title().trim());
    e.setDescription(req.description());
    e.setCategory(req.category());
    e.setVenue(req.venue());
    e.setStartTime(req.startTime());
    e.setEndTime(req.endTime());
    int consumed = e.getTotalSeats() - e.getSeatsAvail();
    e.setTotalSeats(req.totalSeats());
    e.setSeatsAvail(Math.max(0, req.totalSeats() - consumed));
    return e;
  }

  @Override @Transactional
  public void delete(Long id){
    if (!repo.existsById(id)) throw new NotFoundException("Event not found");
    repo.deleteById(id);
  }

  @Override @Transactional
  public void submitForApproval(Long id, Long organizerId){
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    if (organizerId != null && e.getOrganizerId() != null && !organizerId.equals(e.getOrganizerId()))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
    e.setStatus(ApprovalStatus.PENDING_APPROVAL.name());
  }

  @Override @Transactional public void approve(Long id){
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    e.setStatus(ApprovalStatus.APPROVED.name());
  }
  @Override @Transactional public void reject(Long id){
    var e = repo.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
    e.setStatus(ApprovalStatus.REJECTED.name());
  }

  @Override
  public Page<Event> search(String q, String status, int page, int size){
    var pageable = PageRequest.of(Math.max(0,page), Math.min(Math.max(1,size), 100), Sort.by("startTime").descending());
    return repo.search((q==null||q.isBlank())?null:q.trim(), (status==null||status.isBlank())?null:status, pageable);
  }

  @Override public Event get(Long id){
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