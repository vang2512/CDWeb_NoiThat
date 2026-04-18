package com.example.demo.controller;

import com.example.demo.dto.OrderDTO;
import com.example.demo.service.OrderAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invoices")
@CrossOrigin
public class InvoiceController {

    @Autowired
    private OrderAdminService orderAdminService;

    @GetMapping("")
    public List<OrderDTO> getAllInvoices() {
        return orderAdminService.getDeliveredOrders();
    }

    @GetMapping("/{orderId}")
    public OrderDTO getInvoiceDetail(@PathVariable int orderId) {
        return orderAdminService.getOrderDetail(orderId);
    }
}
