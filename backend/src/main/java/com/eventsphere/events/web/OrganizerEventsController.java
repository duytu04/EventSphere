package com.eventsphere.events.web;

import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventCreateRequest;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.dto.EventUpdateRequest;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import com.eventsphere.security.AuthFacade;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cho ORGANIZER (người tổ chức sự kiện).
 * Cho phép organizer quản lý sự kiện của mình: xem danh sách, chi tiết, tạo, chỉnh sửa và gửi duyệt.
 */
@RestController
@RequestMapping("/api/organizer/events")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerEventsController {

  private final EventService svc;
  private final AuthFacade auth;

  public OrganizerEventsController(EventService s, AuthFacade a) {
    this.svc = s;
    this.auth = a;
  }

  /**
   * API: GET /api/organizer/events
   * Organizer xem danh sách sự kiện của chính mình (hỗ trợ tìm kiếm & phân trang).
   */
  @GetMapping
  public PagedResponse<EventResponse> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Long organizerId = auth.currentUserId();
    var mapped = svc.searchByOrganizer(organizerId, q, status, page, size)
        .map(OrganizerEventsController::toDto);
    return PagedResponse.from(mapped);
  }

  /**
   * API: GET /api/organizer/events/{id}
   * Organizer xem chi tiết sự kiện thuộc sở hữu của mình.
   */
  @GetMapping("/{id}")
  public EventResponse detail(@PathVariable Long id) {
    var e = svc.getOwned(id, auth.currentUserId());
    return toDto(e);
  }

  /**
   * API: POST /api/organizer/events
   * Organizer tạo sự kiện mới.
   */
  @PostMapping
  public EventResponse create(@Valid @RequestBody EventCreateRequest req) {
    Long organizerId = auth.currentUserId();
    var e = svc.create(req, organizerId);
    return toDto(e);
  }

  /**
   * API: PUT /api/organizer/events/{id}
   * Organizer cập nhật sự kiện của mình.
   * Lưu ý: Không thể cập nhật sự kiện đã được APPROVED, cần tạo EventEditRequest.
   */
  @PutMapping("/{id}")
  public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest req) {
    try {
      var e = svc.updateForOrganizer(id, req, auth.currentUserId());
      return toDto(e);
    } catch (org.springframework.web.server.ResponseStatusException ex) {
      if (ex.getStatusCode().value() == 403) {
        // Hướng dẫn tạo EventEditRequest thay vì cập nhật trực tiếp
        throw new org.springframework.web.server.ResponseStatusException(
            ex.getStatusCode(), 
            ex.getReason() + " Sử dụng API POST /api/events/" + id + "/edit-request để tạo yêu cầu chỉnh sửa."
        );
      }
      throw ex;
    }
  }

  /**
   * API: POST /api/organizer/events/{id}/submit
   * Organizer gửi sự kiện lên để Admin duyệt (status -> PENDING_APPROVAL).
   */
  @PostMapping("/{id}/submit")
  public void submit(@PathVariable Long id) {
    svc.submitForApproval(id, auth.currentUserId());
  }

  /* ---------------------------------
   * Mapper thống nhất: Entity -> DTO
   * Thứ tự EventResponse bắt buộc:
   * (id, name, description, category, location, mainImageUrl,
   *  startTime, endTime, seatsAvailable, capacity, status, version, attendeesCount)
   * --------------------------------- */
  private static EventResponse toDto(Event e) {
    int total = e.getTotalSeats() != null ? e.getTotalSeats() : 0;
    int available = e.getSeatsAvail() != null ? e.getSeatsAvail() : total;
    long attendeesCount = Math.max(0, total - available);
    return new EventResponse(
        e.getEventId(),
        e.getTitle(),
        e.getDescription(),
        e.getCategory(),
        e.getVenue(),
        e.getMainImageUrl(),
        e.getStartTime(),
        e.getEndTime(),
        e.getSeatsAvail(),
        e.getTotalSeats(),
        e.getStatus(),
        e.getVersion(),
        attendeesCount
    );
  }
}
