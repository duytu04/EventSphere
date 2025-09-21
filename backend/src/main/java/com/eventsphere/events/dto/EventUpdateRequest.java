


package com.eventsphere.events.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record EventUpdateRequest(
    @JsonAlias("name")
    String title,

    String description,

    @Size(max = 512, message = "Đường dẫn ảnh quá dài (tối đa 512 ký tự)")
    @JsonAlias({"mainImageUrl","main_image_url"})
    String mainImageUrl,

    String category,

    @JsonAlias("location")
    String venue,

    // Cho update partial: cho phép null
    LocalDateTime startTime,
    LocalDateTime endTime,

    // Dùng Integer để biết có gửi lên hay không + map từ tên mới
    @JsonAlias("capacity")
    Integer totalSeats,

    // Nếu bạn KHÔNG cho phép chỉnh seatsAvail khi update thì có thể bỏ field này.
    // @JsonAlias("seatsAvailable")
    // Integer seatsAvail,

    // Optimistic lock; nếu bạn muốn bắt buộc client phải gửi, thêm @NotNull
    Long version
) {}
