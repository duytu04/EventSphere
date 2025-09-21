

// package com.eventsphere.events.web;

// import com.eventsphere.events.dto.*;
// import com.eventsphere.security.AuthFacade;

// import com.eventsphere.events.model.Event;
// import com.eventsphere.events.service.EventService;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;
// import jakarta.validation.Valid;

// /**
//  * Controller cho ORGANIZER (người tổ chức sự kiện).
//  * Cho phép organizer tạo sự kiện và gửi yêu cầu duyệt.
//  */
// @RestController
// @RequestMapping("/api/organizer/events")       // Base URL cho organizer
// @PreAuthorize("hasRole('ORGANIZER')")         // Chỉ role ORGANIZER mới gọi được API này
// public class OrganizerEventsController {
  
//   private final EventService svc;  // Service xử lý nghiệp vụ sự kiện
//   private final AuthFacade auth;   // Lấy thông tin user hiện tại từ security context

//   // Constructor injection
//   public OrganizerEventsController(EventService s, AuthFacade a){ 
//     this.svc = s; 
//     this.auth = a; 
//   }

//   /**
//    * API: POST /api/organizer/events
//    * Organizer tạo sự kiện mới.
//    * - organizerId lấy từ AuthFacade (user hiện tại).
//    * - Trả về EventResponse chứa dữ liệu sự kiện vừa tạo.
//    */
//   @PostMapping
//   public EventResponse create(@Valid @RequestBody EventCreateRequest req){
//     Long organizerId = auth.currentUserId();         // Lấy id organizer hiện tại
//     var e = svc.create(req, organizerId);            // Gọi service tạo sự kiện
//     // Trả về DTO EventResponse (ẩn chi tiết entity)
//     return new EventResponse(
//       e.getEventId(),
//       e.getTitle(),
//       e.getDescription(),
//       e.getCategory(),
//       e.getVenue(),
//       e.getMainImageUrl(), 
//       e.getStartTime(),
//       e.getEndTime(),
//       e.getSeatsAvail(),
//       e.getTotalSeats(),
//       e.getStatus(),
//       e.getVersion()
//     );
//   }

//   /**
//    * API: POST /api/organizer/events/{id}/submit
//    * Organizer gửi sự kiện lên để Admin duyệt (status chuyển sang PENDING).
//    * - Yêu cầu organizer phải là owner của event.
//    */
//   @PostMapping("/{id}/submit")
//   public void submit(@PathVariable Long id){
//     svc.submitForApproval(id, auth.currentUserId());
//   }
// }


package com.eventsphere.events.web;

import com.eventsphere.events.dto.EventCreateRequest;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.security.AuthFacade;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * Controller cho ORGANIZER (người tổ chức sự kiện).
 * Cho phép organizer tạo sự kiện và gửi yêu cầu duyệt.
 */
@RestController
@RequestMapping("/api/organizer/events")       // Base URL cho organizer
@PreAuthorize("hasRole('ORGANIZER')")         // Chỉ role ORGANIZER mới gọi được API này
public class OrganizerEventsController {

  private final EventService svc;  // Service xử lý nghiệp vụ sự kiện
  private final AuthFacade auth;   // Lấy thông tin user hiện tại từ security context

  // Constructor injection
  public OrganizerEventsController(EventService s, AuthFacade a){
    this.svc = s;
    this.auth = a;
  }

  /**
   * API: POST /api/organizer/events
   * Organizer tạo sự kiện mới.
   * - organizerId lấy từ AuthFacade (user hiện tại).
   * - Trả về EventResponse chứa dữ liệu sự kiện vừa tạo.
   */
  @PostMapping
  public EventResponse create(@Valid @RequestBody EventCreateRequest req){
    Long organizerId = auth.currentUserId();   // Lấy id organizer hiện tại
    var e = svc.create(req, organizerId);      // Gọi service tạo sự kiện
    return toDto(e);                           // Chuẩn thứ tự + đủ mainImageUrl
  }

  /**
   * API: POST /api/organizer/events/{id}/submit
   * Organizer gửi sự kiện lên để Admin duyệt (status -> PENDING_APPROVAL).
   * - Yêu cầu organizer phải là owner của event.
   */
  @PostMapping("/{id}/submit")
  public void submit(@PathVariable Long id){
    svc.submitForApproval(id, auth.currentUserId());
  }

  /* ---------------------------------
   * Mapper thống nhất: Entity -> DTO
   * Thứ tự EventResponse bắt buộc:
   * (id, name, description, category, location, mainImageUrl,
   *  startTime, endTime, seatsAvailable, capacity, status, version)
   * --------------------------------- */
  private static EventResponse toDto(Event e) {
    return new EventResponse(
        e.getEventId(),        // id
        e.getTitle(),          // name
        e.getDescription(),
        e.getCategory(),
        e.getVenue(),          // location
        e.getMainImageUrl(),   // mainImageUrl (vị trí 6)
        e.getStartTime(),
        e.getEndTime(),
        e.getSeatsAvail(),     // seatsAvailable
        e.getTotalSeats(),     // capacity
        e.getStatus(),
        e.getVersion()
    );
  }
}
