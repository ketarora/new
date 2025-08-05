package com.example.Gruhani.Controllers;


import com.example.Gruhani.Repositories.SellerRepo;
import com.example.Gruhani.Repositories.UserRepo;
import com.example.Gruhani.dtos.userDto;
import com.example.Gruhani.models.Users;
import com.example.Gruhani.service.Mail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
public class ProductandSeller {
    @Autowired
    SellerRepo srepo;
    @Autowired
    UserRepo ur;

@Autowired
    BCryptPasswordEncoder bcp;
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody userDto user) {
        try {
            System.out.println("Register endpoint hit with data: " + user.getName());

            Users sell = new Users();

                sell.setid(java.util.UUID.randomUUID().toString()); // Generate unique ID
                sell.setEmail(user.getEmail());
                Set<String> r = new HashSet<>();
                r.add("ROLE_USER");
                sell.setRole(r);
                sell.setName(user.getName());
                sell.setPassword(bcp.encode(user.getPassword()));
                sell.setContact(user.getContact());


                ur.save(sell);


                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Seller registered successfully");
                response.put("sellerId", sell.getId());

                return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }

    }}
