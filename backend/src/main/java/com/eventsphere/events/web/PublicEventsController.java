// package com.eventsphere.events.web;


// import com.eventsphere.core.util.PagedResponse;

// import com.eventsphere.events.dto.EventResponse;
// import com.eventsphere.events.model.Event;
// import com.eventsphere.events.service.EventService;
// import org.springframework.data.domain.Page;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/events")
// public class PublicEventsController {
//   private final EventService svc;
//   public PublicEventsController(EventService s){ this.svc = s; }

//   @GetMapping
//   public PagedResponse<EventResponse> list(
//       @RequestParam(defaultValue="") String q,
//       @RequestParam(defaultValue="APPROVED") String status,
//       @RequestParam(defaultValue="0") int page,
//       @RequestParam(defaultValue="10") int size
//   ){
//     Page<Event> p = svc.search(q, status, page, size);
//     var mapped = p.map(e -> new EventResponse(
//       e.getEventId(), e.getTitle(), e.getDescription(), e.getCategory(), e.getVenue(),
//       e.getStartTime(), e.getEndTime(), e.getSeatsAvail(), e.getTotalSeats(), e.getStatus(), e.getVersion()
//     ));
//     return PagedResponse.from(mapped);
//   }

//   @GetMapping("/{id}")
//   public EventResponse detail(@PathVariable Long id){
//     var e = svc.get(id);
//     return new EventResponse(
//       e.getEventId(), e.getTitle(), e.getDescription(), e.getCategory(), e.getVenue(),
//       e.getStartTime(), e.getEndTime(), e.getSeatsAvail(), e.getTotalSeats(), e.getStatus(), e.getVersion()
//     );
//   }
// }

package com.eventsphere.events.web;

import com.eventsphere.core.util.PagedResponse;
import com.eventsphere.events.dto.EventResponse;
import com.eventsphere.events.model.Event;
import com.eventsphere.events.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events") // hoặc dùng "/api/public/events" nếu SecurityConfig permitAll cho nhánh này
public class PublicEventsController {
  private final EventService svc;
  public PublicEventsController(EventService s){ this.svc = s; }

  @GetMapping
  public PagedResponse<EventResponse> list(
      @RequestParam(defaultValue = "") String q,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ){
    // ép cứng status = APPROVED
    Page<Event> p = svc.search(q, "APPROVED", page, size);
    var mapped = p.map(PublicEventsController::map);
    return PagedResponse.from(mapped);
  }

  @GetMapping("/{id}")
  public EventResponse detail(@PathVariable Long id){
    var e = svc.get(id); // đảm bảo svc.get ném NOT_FOUND nếu không có
    return map(e);
  }

  /* mapper */
  private static EventResponse map(Event e){
    return new EventResponse(
      e.getEventId(),
      e.getTitle(),
      e.getDescription(),
      e.getCategory(),
      e.getVenue(),
      e.getStartTime(),
      e.getEndTime(),
      e.getSeatsAvail(),
      e.getTotalSeats(),
      e.getStatus(),
      e.getVersion()
    );
  }
}
