package com.partikar.geocode;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GeocodeController {

    private final GeocodeService geocodeService;

    public GeocodeController(GeocodeService geocodeService) {
        this.geocodeService = geocodeService;
    }

    @GetMapping("/api/geocode")
    public List<GeocodeResult> search(@RequestParam(name = "q") String q,
                                      @RequestParam(name = "limit", defaultValue = "5") int limit) {
        if (q == null || q.trim().isEmpty()) return List.of();
        return geocodeService.search(q, Math.max(1, Math.min(limit, 10)));
    }
}

