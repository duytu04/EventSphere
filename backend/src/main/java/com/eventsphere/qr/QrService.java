package com.eventsphere.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import org.springframework.stereotype.Service;

@Service
public class QrService {

  private final QRCodeWriter writer = new QRCodeWriter();

  public byte[] generatePng(String payload, int width, int height) {
    if (payload == null || payload.isBlank()) {
      throw new IllegalArgumentException("payload must not be blank");
    }
    try {
      BitMatrix matrix = writer.encode(payload, BarcodeFormat.QR_CODE, width, height);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      MatrixToImageWriter.writeToStream(matrix, "PNG", out, new MatrixToImageConfig());
      return out.toByteArray();
    } catch (WriterException | IOException ex) {
      throw new IllegalStateException("Could not generate QR code", ex);
    }
  }

  public String generateDataUrl(String payload, int size) {
    byte[] png = generatePng(payload, size, size);
    return "data:image/png;base64," + Base64.getEncoder().encodeToString(png);
  }
}
