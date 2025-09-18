package com.eventsphere.core.util;

import java.util.List;
import org.springframework.data.domain.Page;

/** Wrapper chuẩn cho Page<T> để trả JSON gọn, cố định cấu trúc. */
public class PagedResponse<T> {
  private int page;
  private int size;
  private long totalElements;
  private int totalPages;
  private List<T> content;

  public PagedResponse() {}

  public PagedResponse(int page, int size, long totalElements, int totalPages, List<T> content) {
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.content = content;
  }

  public static <T> PagedResponse<T> from(Page<T> p) {
    return new PagedResponse<>(
      p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.getContent()
    );
  }

  // getters / setters
  public int getPage() { return page; }
  public void setPage(int page) { this.page = page; }
  public int getSize() { return size; }
  public void setSize(int size) { this.size = size; }
  public long getTotalElements() { return totalElements; }
  public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
  public int getTotalPages() { return totalPages; }
  public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
  public List<T> getContent() { return content; }
  public void setContent(List<T> content) { this.content = content; }
}
