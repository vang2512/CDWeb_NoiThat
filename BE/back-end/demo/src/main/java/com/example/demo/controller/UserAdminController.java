package com.example.demo.controller;

import com.example.demo.entity.Users;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.UserService;


import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin
public class UserAdminController {

    private final UserRepository usersRepository;
    private final UserService userService;

    public UserAdminController(
            UserRepository usersRepository,
            UserService userService
            )
    {
        this.usersRepository = usersRepository;
        this.userService = userService;
    }

    @GetMapping
    public List<Users> getAllUsers() {
        return usersRepository.findByIsDeletedFalse();
    }

    @PostMapping
    public Users addUser(@RequestBody Users user) {
        user.setPassword(userService.hashPassword(user.getPassword()));
        user.setIsDeleted(false);
        return usersRepository.save(user);
    }

    @PutMapping("/{id}")
    public Users updateUser(
            @PathVariable Integer id,
            @RequestBody Users req
    ) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        user.setDateOfBirth(req.getDateOfBirth());
        user.setRole(req.getRole());
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            user.setPassword(userService.hashPassword(req.getPassword()));
        }
        return usersRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsDeleted(true);
        usersRepository.save(user);
    }
}
