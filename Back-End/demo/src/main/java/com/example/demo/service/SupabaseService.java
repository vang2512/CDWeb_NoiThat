package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.UUID;

@Service
public class SupabaseService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadFile(MultipartFile file) {
        try {
            String extension = "jpg";
            String contentType = file.getContentType();

            if (contentType != null) {
                if (contentType.contains("png")) extension = "png";
                else if (contentType.contains("webp")) extension = "webp";
                else if (contentType.contains("jpeg")) extension = "jpg";
            }

            String fileName = UUID.randomUUID() + "." + extension;

            String uploadUrl = String.format(
                    "%s/storage/v1/object/%s/%s",
                    supabaseUrl,
                    bucketName,
                    fileName
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return String.format(
                        "%s/storage/v1/object/public/%s/%s",
                        supabaseUrl,
                        bucketName,
                        fileName
                );
            }

            throw new RuntimeException("Upload failed");

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}