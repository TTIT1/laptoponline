package com.example.springbootlaptoop.service;

import com.example.springbootlaptoop.model.Invoice;
import com.example.springbootlaptoop.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private JavaMailSender mailSender;

    public Invoice createInvoice(Invoice invoice) {
        Invoice savedInvoice = invoiceRepository.save(invoice);
        // Try sending email but do not fail the invoice creation if email fails
        try {
            sendInvoiceEmail(savedInvoice);
        } catch (RuntimeException ex) {
            // Log and continue; depending on your logging setup, replace with logger
            ex.printStackTrace();
        }
        return savedInvoice;
    }

    private void sendInvoiceEmail(Invoice invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("thetruongit1236@gmail.com");
            helper.setTo(invoice.getCustomerEmail());
            helper.setSubject("Xác nhận đơn hàng - Cửa hàng Laptop");

            String emailContent = String.format("""
                Kính gửi %s,
                
                Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi.
                
                Chi tiết hóa đơn:
                - Mã hóa đơn: %d
                - Sản phẩm: %s
                - Tổng tiền: %,.0f VNĐ
                - Phương thức thanh toán: %s
                - Ngày mua: %s
                
                Địa chỉ giao hàng:
                %s
                
                Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
                
                Trân trọng,
                Cửa hàng laptop
                """,
                invoice.getCustomerName(),
                invoice.getId(),
                invoice.getLaptop().getLaptopName(),
                invoice.getTotalAmount(),
                getPaymentMethodText(invoice.getPaymentMethod()),
                invoice.getPurchaseDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                invoice.getCustomerAddress()
            );

            helper.setText(emailContent, false);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            // Wrap to signal failure to caller, handled in createInvoice
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    private String getPaymentMethodText(String method) {
        return switch (method) {
            case "COD" -> "Thanh toán khi nhận hàng";
            case "BANK" -> "Chuyển khoản ngân hàng";
            case "MOMO" -> "Ví MoMo";
            default -> method;
        };
    }
} 