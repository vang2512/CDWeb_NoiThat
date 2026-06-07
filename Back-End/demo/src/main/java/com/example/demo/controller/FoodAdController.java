package com.example.demo.controller;

import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductSpecification;
import com.example.demo.entity.SubImage;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.FoodRepository;
import com.example.demo.service.SupabaseService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/foods")
@CrossOrigin(origins = "*")
public class FoodAdController {

    private final FoodRepository foodRepository;
    private final SupabaseService supabaseService;
    private final CategoryRepository categoryRepository;
    public FoodAdController(FoodRepository foodRepository, SupabaseService supabaseService, CategoryRepository categoryRepository) {
        this.foodRepository = foodRepository;
        this.supabaseService = supabaseService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Product> getAllFoods() {
        return foodRepository.findByIsDeletedFalse();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductDetail(@PathVariable int id) {

        Product product = foodRepository.findById(id)
                .orElse(null);

        if (product == null || Boolean.TRUE.equals(product.getIsDeleted())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }
    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable int id) {

        Product food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        food.setIsDeleted(true);
        foodRepository.save(food);
        return ResponseEntity.ok().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("discount") int discount,
            @RequestParam("categoryId") int categoryId,

            @RequestParam("material") String material,
            @RequestParam("origin") String origin,
            @RequestParam("standard") String standard,
            @RequestParam("dimensions") String dimensions,

            @RequestPart(value = "img", required = true) MultipartFile img,
            @RequestPart(value = "subImages", required = false) List<MultipartFile> subImages
    ) {

        // 1. Upload ảnh chính lên Supabase
        String mainImageUrl = supabaseService.uploadFile(img);

        // 2. Category
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 3. Product
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setDiscount(discount);
        product.setCategory(category);
        product.setImg(mainImageUrl);

        // 4. Specification
        ProductSpecification spec = new ProductSpecification();
        spec.setMaterial(material);
        spec.setOrigin(origin);
        spec.setStandard(standard);
        spec.setDimensions(dimensions);
        spec.setProduct(product);

        product.setSpecification(spec);

        // 5. Sub images
        List<SubImage> list = new ArrayList<>();

        if (subImages != null) {
            for (MultipartFile file : subImages) {
                String url = supabaseService.uploadFile(file);

                SubImage s = new SubImage();
                s.setImage(url);
                s.setProduct(product);

                list.add(s);
            }
        }

        product.setSubImages(list);

        return foodRepository.save(product);
    }
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product updateProduct(
            @PathVariable int id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("discount") int discount,
            @RequestParam("categoryId") int categoryId,

            @RequestParam("material") String material,
            @RequestParam("origin") String origin,
            @RequestParam("standard") String standard,
            @RequestParam("dimensions") String dimensions,

            @RequestPart(value = "img", required = false) MultipartFile img,
            @RequestPart(value = "subImages", required = false) List<MultipartFile> subImages
    ) {

        Product product = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // update basic
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setDiscount(discount);
        product.setCategory(category);

        // update image (nếu có)
        if (img != null && !img.isEmpty()) {
            String imgUrl = supabaseService.uploadFile(img);
            product.setImg(imgUrl);
        }

        // update specification
        ProductSpecification spec = product.getSpecification();
        if (spec == null) {
            spec = new ProductSpecification();
            spec.setProduct(product);
        }

        spec.setMaterial(material);
        spec.setOrigin(origin);
        spec.setStandard(standard);
        spec.setDimensions(dimensions);

        product.setSpecification(spec);

        // update subImages (replace kiểu đơn giản)
        if (subImages != null && !subImages.isEmpty()) {


            product.getSubImages().clear(); // xoá cũ


            List<SubImage> newList = new ArrayList<>();

            for (MultipartFile file : subImages) {
                String url = supabaseService.uploadFile(file);

                SubImage s = new SubImage();
                s.setImage(url);
                s.setProduct(product);

                newList.add(s);
            }

            product.setSubImages(newList);
        }

        return foodRepository.save(product);
    }
}
