package com.eventsphere.attendance.service;

import com.eventsphere.attendance.dto.AttendanceMarkRequest;
import com.eventsphere.attendance.dto.AttendanceResponse;
import com.eventsphere.core.util.PagedResponse;

public interface AttendanceService {

    // Organizer quét/đánh dấu
    AttendanceResponse markByOrganizer(Long organizerId, AttendanceMarkRequest req);

    // Participant bấm "Xem QR" -> sinh token mới; các token cũ của (user,event) bị vô hiệu
    String createQrTokenForMe(Long currentUserId, Long eventId);

    // Organizer xem lịch sử điểm danh của sự kiện
    PagedResponse<AttendanceResponse> getLogsForEvent(Long organizerId, Long eventId, int page, int size);
}
