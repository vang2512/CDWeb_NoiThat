package com.example.demo.controller;

import com.example.demo.dto.OrderDTO;
import com.example.demo.service.OrderAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/orders")
@CrossOrigin("*")
public class OrderAdController {

    @Autowired
    private OrderAdminService orderAdminService;

    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderAdminService.getAllOrders();
    }

    @GetMapping("/{orderId}")
    public OrderDTO getOrderDetail(@PathVariable int orderId) {
        return orderAdminService.getOrderDetail(orderId);
    }

    @PutMapping("/{orderId}/status")
    public String updateOrderStatus(@PathVariable int orderId, @RequestBody String status) {
        orderAdminService.updateOrderStatus(orderId, status.replace("\"", ""));
        return "Cập nhật trạng thái thành công";
    }

}
