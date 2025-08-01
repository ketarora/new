package com.example.Gruhani.Controllers;


import com.example.Gruhani.Repositories.ProductRepo;
import com.example.Gruhani.dtos.productdto;
import com.example.Gruhani.models.product;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@RestController
public class image_to_cart {
@Autowired
    ProductRepo prepo;

        @CrossOrigin("https://grihini-1.onrender.com")
        @PostMapping("/upload")
        public ResponseEntity<List<productdto>> methew(@RequestParam("file") MultipartFile file) throws IOException {
            // 👇 Load credentials from resources folder (works in JAR on Render)
            GoogleCredentials credentials;
            try (InputStream credentialsStream = getClass().getResourceAsStream("/credentials.json")) {
                if (credentialsStream == null) {
                    throw new IOException("credentials.json not found in resources!");
                }
                credentials = GoogleCredentials.fromStream(credentialsStream);
            }

            ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();

            try (ImageAnnotatorClient vision = ImageAnnotatorClient.create(settings)) {
                ByteString imgBytes = ByteString.copyFrom(file.getBytes());
                Image image = Image.newBuilder().setContent(imgBytes).build();
                Feature feature = Feature.newBuilder().setType(Feature.Type.DOCUMENT_TEXT_DETECTION).build();

                AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                        .setImage(image)
                        .addFeatures(feature)
                        .build();

                BatchAnnotateImagesResponse response = vision.batchAnnotateImages(List.of(request));
                AnnotateImageResponse res = response.getResponses(0);
                String extractedText = res.getFullTextAnnotation().getText();
                System.out.println(extractedText);

                String[] arr = extractedText.split("\\r?\\n");
                List<product> l = new ArrayList<>();

                for (String name : arr) {
                    System.out.println("inside loop: " + name);
                    if (prepo.existsByname(name)) {
                        product p = prepo.findByname(name);
                        System.out.println("Matched: " + p);
                        l.add(p);
                    }
                }

                List<productdto> dtoList = l.stream()
                        .map(entity -> {
                            productdto dto = new productdto();
                            BeanUtils.copyProperties(entity, dto);
                            return dto;
                        })
                        .toList();

                return ResponseEntity.ok(dtoList);
            }
        }

    }
        /*
        GoogleCredentials credentials;
        try (InputStream credentialsStream = getClass().getResourceAsStream("/credentials.json")) {
            if (credentialsStream == null) {
                throw new IOException("credentials.json not found in resources!");
            }
            credentials = GoogleCredentials.fromStream(credentialsStream);
        }

        ImageAnnotatorSettings settings = ImageAnnotatorSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();
        ImageAnnotatorClient vision = ImageAnnotatorClient.create(settings);
        // System.out.print("googlr"+);
        System.out.println("file"+file);

        ByteString imgBytes = ByteString.copyFrom(file.getBytes());

        Image image = Image.newBuilder().setContent(imgBytes).build();
        Feature feature = Feature.newBuilder().setType(Feature.Type.DOCUMENT_TEXT_DETECTION).build();

        AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                .setImage(image)
                .addFeatures(feature)
                .build();

        BatchAnnotateImagesResponse response = vision.batchAnnotateImages(List.of(request));
        AnnotateImageResponse res = response.getResponses(0);

        String extractedText = res.getFullTextAnnotation().getText();
        System.out.println(extractedText);

        String[] arr =extractedText.split("\\r?\\n");
        List<product>list=new ArrayList<>();

        List<product>l=new ArrayList<>();

        for(int i=0;i<arr.length;i++)
        {
            System.out.println("inside luupoooooo"+arr[i]);
            if(prepo.existsByname(arr[i])) {
                System.out.println("listooo"+prepo.findByname(arr[i]));
                l.add(prepo.findByname(arr[i]));
                System.out.println("listooo"+l.get(0));

            }
        }
        List<productdto>pdto=new ArrayList<>();
        List<productdto> dtoList = l.stream()
                .map(entity -> {
                    productdto dto = new productdto();
                    BeanUtils.copyProperties(entity, dto);
                    return dto;
                })
                .toList();



        return ResponseEntity.ok(dtoList);


    }

}*/
