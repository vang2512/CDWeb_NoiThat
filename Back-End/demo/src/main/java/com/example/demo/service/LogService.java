package com.example.demo.service;

import com.example.demo.entity.Logs;
import com.example.demo.entity.Users;
import com.example.demo.model.LogType;
import com.example.demo.model.Status;
import com.example.demo.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.demo.dto.LogDTO;
import java.time.LocalDateTime;

@Service
public class LogService {

    @Autowired
    private LogRepository logRepository;

    public void saveAuthLog(String action, Users user, Status status, String message, String ip) {
        Logs log = new Logs();
        log.setType(LogType.AUTH);
        log.setAction(action);

        if (user != null) {
            log.setUser(user);
            log.setUsername(user.getEmail());
        }

        log.setStatus(Status.SUCCESS);
        log.setMessage(message);
        log.setIpAddress(ip);
        log.setCreatedAt(LocalDateTime.now());

        logRepository.save(log);
    }

    public void saveActivityLog(String action, String module, Users user, String message, String ip) {
        Logs log = new Logs();
        log.setType(LogType.ACTIVITY);
        log.setAction(action);
        log.setModule(module);

        if (user != null) {
            log.setUser(user);
            log.setUsername(user.getEmail());
        }

        log.setMessage(message);
        log.setIpAddress(ip);
        log.setCreatedAt(LocalDateTime.now());

        logRepository.save(log);
    }
    public Page<LogDTO> getAllLogs(Pageable pageable) {

        Page<Logs> logs = logRepository.findAllByOrderByCreatedAtDesc(pageable);

        return logs.map(log -> new LogDTO(
                log.getId(),
                log.getType().name(),
                log.getAction(),
                log.getModule(),
                log.getUsername(),
                log.getMessage(),
                log.getIpAddress(),
                log.getCreatedAt()
        ));
    }

}