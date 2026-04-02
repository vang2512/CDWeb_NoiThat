package com.example.demo.service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    private final String senderEmail = "nguyenvanvang2626@gmail.com";
    private final String senderPassword = "npcc gdpd irxl slak";

    public void sendOtpEmail(String recipient, String otp) {

        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(senderEmail, senderPassword);
            }
        });

        try {
            Message message = new MimeMessage(session);

            message.setFrom(new InternetAddress(senderEmail, "BAYA Support"));
            message.setRecipients(
                    Message.RecipientType.TO,
                    InternetAddress.parse(recipient)
            );
            message.setSubject("BAYA - Mã OTP xác thực tài khoản");

            String htmlContent =
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<body style='margin:0;background:#f4f6f8;font-family:Arial'>" +

                            "<table width='100%' cellpadding='0' cellspacing='0'>" +
                            "<tr><td align='center'>" +

                            "<table width='480' style='background:#ffffff;margin-top:40px;border-radius:12px;padding:25px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.1)'>" +

                            // LOGO
                            "<tr><td>" +
                            "<h2 style='color:#ff4d4f;margin:0'>BAYA</h2>" +
                            "</td></tr>" +

                            // TITLE
                            "<tr><td>" +
                            "<h3 style='margin:10px 0;color:#333'>Xác thực tài khoản</h3>" +
                            "<p style='color:#777;font-size:14px'>Sử dụng mã OTP bên dưới để hoàn tất đăng ký</p>" +
                            "</td></tr>" +

                            // OTP BOX
                            "<tr><td style='padding:20px'>" +
                            "<div style='display:inline-block;background:#ff4d4f;color:#fff;font-size:32px;padding:14px 28px;border-radius:10px;letter-spacing:6px;font-weight:bold'>" +
                            otp +
                            "</div>" +
                            "</td></tr>" +

                            // INFO
                            "<tr><td>" +
                            "<p style='color:#555'>Mã có hiệu lực trong <b>1 phút</b></p>" +
                            "<p style='font-size:12px;color:#aaa'>Nếu bạn không yêu cầu, hãy bỏ qua email này</p>" +
                            "</td></tr>" +

                            // FOOTER
                            "<tr><td style='padding-top:20px'>" +
                            "<p style='font-size:12px;color:#bbb'>© 2026 BAYA. All rights reserved.</p>" +
                            "</td></tr>" +

                            "</table>" +

                            "</td></tr></table>" +

                            "</body></html>";

            message.setContent(htmlContent, "text/html; charset=UTF-8");

            Transport.send(message);

            System.out.println("Gửi OTP thành công đến: " + recipient);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage());
        }
    }
}