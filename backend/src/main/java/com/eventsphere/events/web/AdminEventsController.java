



// package com.eventsphere.events.web;

// import com.eventsphere.events.dto.EventCreateRequest;
// import com.eventsphere.events.dto.EventResponse;
// import com.eventsphere.events.dto.EventUpdateRequest;
// import com.eventsphere.events.model.Event;
// import com.eventsphere.events.service.EventService;
// import com.eventsphere.core.util.PagedResponse;

// import jakarta.validation.Valid;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// /**
//  * Controller dành riêng cho ADMIN quản lý sự kiện.
//  * Bao gồm các API CRUD, duyệt/từ chối sự kiện, và tìm kiếm theo trang.
//  */
// @RestController
// @RequestMapping("/api/admin/events")        // base path cho toàn bộ API
// @PreAuthorize("hasRole('ADMIN')")           // chỉ ADMIN mới truy cập được
// public class AdminEventsController {

//   private final EventService svc;

//   // Inject EventService qua constructor
//   public AdminEventsController(EventService s) {
//     this.svc = s;
//   }

//   /**
//    * API tạo sự kiện mới (ADMIN tạo thay cho organizer).
//    * Trả về HTTP 201 CREATED nếu thành công.
//    */
//   @PostMapping
//   @ResponseStatus(HttpStatus.CREATED)
//   public EventResponse create(@Valid @RequestBody EventCreateRequest req) {
//     var e = svc.create(req, null); // organizerId = null (ADMIN tạo trực tiếp)
//     return map(e);
//   }

//   /**
//    * API lấy chi tiết sự kiện theo ID.
//    * Trả về HTTP 200 OK cùng với thông tin sự kiện.
//    */
//   @GetMapping("/{id}")
//   public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
//     // Lấy entity rồi map -> đồng nhất với create/update
//     var e = svc.getAdminEventById(id);   // <-- Service nên cung cấp method này
//     return ResponseEntity.ok(map(e));
//   }
//   /**
//    * API cập nhật sự kiện.
//    * Trả về thông tin sự kiện sau khi cập nhật.
//    */
//   @PutMapping("/{id}")
//   public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest req) {
//     var e = svc.update(id, req);
//     return map(e);
//   }

//   /**
//    * API xóa sự kiện theo ID.
//    * Trả về HTTP 204 NO CONTENT nếu xóa thành công.
//    */
//   @DeleteMapping("/{id}")
//   @ResponseStatus(HttpStatus.NO_CONTENT)
//   public void delete(@PathVariable Long id) {
//     svc.delete(id);
//   }

//   /**
//    * API duyệt sự kiện (chuyển trạng thái -> APPROVED).
//    * Trả về HTTP 204 NO CONTENT.
//    */
//   @PostMapping("/{id}/approve")
//   @ResponseStatus(HttpStatus.NO_CONTENT)
//   public void approve(@PathVariable Long id) {
//     svc.approve(id);
//   }

//   /**
//    * API từ chối sự kiện (chuyển trạng thái -> REJECTED).
//    * Trả về HTTP 204 NO CONTENT.
//    */
//   @PostMapping("/{id}/reject")
//   @ResponseStatus(HttpStatus.NO_CONTENT)
//   public void reject(@PathVariable Long id) {
//     svc.reject(id);
//   }

//   /**
//    * API lấy danh sách sự kiện với phân trang, tìm kiếm và lọc theo trạng thái.
//    * - q: từ khóa tìm kiếm (title/description)
//    * - status: lọc theo trạng thái (PENDING, APPROVED...)
//    * - page/size: phân trang
//    */
//   @GetMapping
//   public PagedResponse<EventResponse> list(
//       @RequestParam(required = false) String q,
//       @RequestParam(required = false) String status,
//       @RequestParam(defaultValue = "0") int page,
//       @RequestParam(defaultValue = "10") int size
//   ) {
//     var result = svc.search(q, status, page, size);              // gọi service tìm kiếm
//     var mapped = result.map(AdminEventsController::map);         // chuyển Event -> EventResponse
//     return PagedResponse.from(mapped);                           // đóng gói thành response chuẩn
//   }

//   /* --------- mapper ---------
//    * Hàm tiện ích chuyển từ entity Event -> DTO EventResponse
//    * để trả về cho client. DTO giúp che giấu chi tiết nội bộ entity.
//    */
//   private static EventResponse map(Event e) {
//     return new EventResponse(
//         e.getEventId(),
//         e.getTitle(),
//         e.getDescription(),
//         e.getMainImageUrl(),
//         e.getCategory(),
//         e.getVenue(),
//         e.getStartTime(),
//         e.getEndTime(),
//         e.getSeatsAvail(),
//         e.getTotalSeats(),
//         e.getStatus(),
//         e.getVersion()
//     );
//   }
// }


package com.eventsphere.events.web;

import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventCreateRequest;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.dto.EventUpdateRequest;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller dành riêng cho ADMIN quản lý sự kiện.
 * Bao gồm các API CRUD, duyệt/từ chối sự kiện, và tìm kiếm theo trang.
 */
@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventsController {

  private final EventService svc;

  public AdminEventsController(EventService s) {
    this.svc = s;
  }

  /**
   * API tạo sự kiện mới (ADMIN tạo thay organizer).
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EventResponse create(@Valid @RequestBody EventCreateRequest req) {
    var e = svc.create(req, null); // organizerId = null (ADMIN tạo trực tiếp)
    return map(e);
  }

  /**
   * API lấy chi tiết sự kiện theo ID.
   */
  @GetMapping("/{id}")
  public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
    // Dùng method sẵn có để đơn giản hoá service
    var e = svc.get(id); // (hoặc svc.getAdminEventById(id) nếu bạn muốn tách riêng)
    return ResponseEntity.ok(map(e));
  }

  /**
   * API cập nhật sự kiện.
   */
  @PutMapping("/{id}")
  public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventUpdateRequest req) {
    var e = svc.update(id, req);
    return map(e);
  }

  /**
   * API xóa sự kiện theo ID.
   */
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    svc.delete(id);
  }

  /**
   * API duyệt sự kiện (APPROVED).
   */
  @PostMapping("/{id}/approve")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void approve(@PathVariable Long id) {
    svc.approve(id);
  }

  /**
   * API từ chối sự kiện (REJECTED).
   */
  @PostMapping("/{id}/reject")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void reject(@PathVariable Long id) {
    svc.reject(id);
  }

  /**
   * API danh sách sự kiện (phân trang + tìm kiếm + lọc trạng thái).
   */
  @GetMapping
  public PagedResponse<EventResponse> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    var result = svc.search(q, status, page, size);
    var mapped = result.map(AdminEventsController::map);
    return PagedResponse.from(mapped);
  }

  // =========================
  // Mapper: Entity -> DTO
  // Thứ tự EventResponse:
  // (id, name, description, category, location, mainImageUrl,
  //  startTime, endTime, seatsAvailable, capacity, status, version)
  // =========================
  private static EventResponse map(Event e) {
    return new EventResponse(
        e.getEventId(),       // id
        e.getTitle(),         // name
        e.getDescription(),
        e.getCategory(),
        e.getVenue(),         // location
        e.getMainImageUrl(),  // mainImageUrl (vị trí 6)
        e.getStartTime(),
        e.getEndTime(),
        e.getSeatsAvail(),    // seatsAvailable
        e.getTotalSeats(),    // capacity
        e.getStatus(),
        e.getVersion()
    );
  }
}
