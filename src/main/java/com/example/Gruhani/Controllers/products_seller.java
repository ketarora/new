package com.example.Gruhani.Controllers;



import com.example.Gruhani.Repositories.ProductRepo;
import com.example.Gruhani.Repositories.SellerRepo;
import com.example.Gruhani.dtos.productdto;
import com.example.Gruhani.models.Idclass;
import com.example.Gruhani.models.SelectedOrderadmin;
import com.example.Gruhani.models.Seller;
import com.example.Gruhani.models.product;
import com.example.Gruhani.protobuf.ProductOuterClass;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class products_seller {
    @Autowired
    SellerRepo sr;
    @Autowired
    ProductRepo prepo;

    @PostMapping("/add-product")
    public ResponseEntity<?> method(@RequestBody productdto pdto) {
        System.out.println("inside add prodict");
        Map<String, Object> response = new HashMap<>();
        ;
        try {
            product pr = new product();
            pr.setDescription(pdto.getDescription());
            pr.setImage(pdto.getImage());
            pr.setPrice(pdto.getPrice());
            pr.setName(pdto.getName());
            pr.setRating(pdto.getRating());
            pr.setStatus("pending");
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();
            System.out.println("pehle instanve ke");
            if (principal instanceof UserDetails) {
                System.out.println("bbad instanve ke" + principal);
                UserDetails user = (UserDetails) principal;
                System.out.println("Username: " + user.getUsername());
                System.out.println("Authorities: " + user.getAuthorities());
                System.out.println("email");
                Seller seller = sr.findByemail(user.getUsername());
                System.out.println("pseller" + seller);
                pr.setSeller(seller);
            }
            System.out.print("product" + pr);
            pr.setId(java.util.UUID.randomUUID().toString());
            pr.setVerified(pdto.isVerified());
            pr.setCategory(pdto.getCategory());
            pr.setSubcategory(pdto.getSubcategory());


            pr.setStatus("pending");
            prepo.save(pr);

            response.put("success", true);
            response.put("message", "Seller registered successfully");


            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }


    }

    @CrossOrigin("*")
    @GetMapping(value = "/get-all-products", produces = "application/x-protobuf")
    public ResponseEntity<ProductOuterClass.ProductList> getProductsAsProtobuf() {
        List<product> dbProducts = prepo.findAllBystatus("approved");

        ProductOuterClass.ProductList.Builder listBuilder = ProductOuterClass.ProductList.newBuilder();

        for (product p : dbProducts) {
            ProductOuterClass.Producto protoProduct = ProductOuterClass.Producto.newBuilder()
                    .setId(p.getId())
                    .setName(p.getName())
                    .setDescription(p.getDescription())
                    .setPrice(p.getPrice())
                    .setRating(p.getRating())

                    .setVerified(p.getVerified()==null?false:p.getVerified())
                    .setBadge(p.getBadge())
                    .setCategory(p.getCategory())
                    .setSubcategory(p.getSubcategory())
                    .setStock(p.getStock())
                    .setImage(p.getImage())
                    .build();

            listBuilder.addProducts(protoProduct);
        }

        return ResponseEntity
                .ok()
                .contentType(new MediaType("application", "x-protobuf"))
                .body(listBuilder.build());
    }





@GetMapping("/get-all-products00")
        public ResponseEntity<?> method() {
            List<product> l = prepo.findAllBystatus("approved");
            Map<String, Object> response = new HashMap<>();
            //here in response the product dto attributes will be mapped and sent to frontend
            return ResponseEntity.ok().body(l);

        }

        @CrossOrigin(origins = "http://localhost:8086", allowCredentials = "true")
        @GetMapping("/view-pending")
        public ResponseEntity<?> methods() {

            List<product> l = prepo.findAllBystatus("pending");
            System.out.print("list0" + l);
      /*  List<productdto>s= l.stream()
                .map(product -> {
                    productdto dto = new productdto();
                    BeanUtils.copyProperties(product, dto);
                    return dto;
                })
                .collect(Collectors.toList());*/

            return ResponseEntity.ok().body(l);
        }

        @PostMapping("/accept-item")
        public ResponseEntity<String> meth(@RequestBody SelectedOrderadmin sb) {
            List<Idclass> selectedOrders = sb.getSelectedOrders();

            System.out.print("lullu" + selectedOrders);
            for (Idclass i : selectedOrders) {
                String id = i.getId();
                product p = prepo.findByid(id);
                p.setStatus("approved");
                System.out.print("product" + p);

                prepo.save(p);
            }
            return ResponseEntity.ok().body("ok");
        }

        @PostMapping("/reject-item")
        public ResponseEntity<String> methods(@RequestBody SelectedOrderadmin sb) {
            List<Idclass> selectedOrders = sb.getSelectedOrders();

            System.out.print("lullu" + selectedOrders);
            for (Idclass i : selectedOrders) {
                String id = i.getId();
                product p = prepo.findByid(id);
                p.setStatus("rejected");
                System.out.print("product" + p);

                prepo.save(p);
            }
            return ResponseEntity.ok().body("ok");
        }

        String VERIFY_TOKEN = "gruhani-token";


        // same as the one you gave in dashboard
        @GetMapping("/got-message")
        public ResponseEntity<String> verifyWebhook(
                @RequestParam("hub.mode") String mode,
                @RequestParam("hub.verify_token") String token,
                @RequestParam("hub.challenge") String challenge) {
            System.out.print("reached inside");

            if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
                return ResponseEntity.ok(challenge);  // ✅ Verification success
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification failed kutttsss");
            }
        }

        @PostMapping("/got-message")
        public ResponseEntity<String> vanshi(@RequestBody Map<String, Object> payload) {
            System.out.println("mesaage form user0" + payload);
            return ResponseEntity.ok("done");
        }


    }








