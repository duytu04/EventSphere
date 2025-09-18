package com.eventsphere.event;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/events")
public class EventController {
  private final EventRepository repo;
  public EventController(EventRepository repo){ this.repo = repo; }

  @GetMapping public List<Event> list(){ return repo.findAll(); }

  @GetMapping("/{id}")
  public Event get(@PathVariable Long id){ return repo.findById(id).orElseThrow(); }

  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping public Event create(@RequestBody Event e){ return repo.save(e); }

  @PutMapping("/{id}")
  public Event update(@PathVariable Long id, @RequestBody Event in){
    Event e = repo.findById(id).orElseThrow();
    e.setName(in.getName());
    e.setDescription(in.getDescription());
    e.setLocation(in.getLocation());
    e.setStartTime(in.getStartTime());
    e.setEndTime(in.getEndTime());
    e.setCapacity(in.getCapacity());
    return repo.save(e);
  }

  @ResponseStatus(HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id){ repo.deleteById(id); }
}
