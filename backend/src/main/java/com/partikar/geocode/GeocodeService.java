package com.partikar.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeocodeService {

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private static class CacheEntry {
        final long ts;
        final List<GeocodeResult> results;
        CacheEntry(long ts, List<GeocodeResult> results) { this.ts = ts; this.results = results; }
    }

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long ttlMillis = 5 * 60 * 1000; // 5 minutes

    public List<GeocodeResult> search(String q, int limit) {
        if (q == null || q.trim().length() < 2) return List.of();
        q = q.trim();

        String key = q.toLowerCase() + "|" + limit;
        long now = Instant.now().toEpochMilli();
        CacheEntry cached = cache.get(key);
        if (cached != null && (now - cached.ts) < ttlMillis) return cached.results;

        try {
            // Recherche ULTRA RAPIDE sur les communes françaises
            String url = "https://api-adresse.data.gouv.fr/search/"
                    + "?q=" + java.net.URLEncoder.encode(q, java.nio.charset.StandardCharsets.UTF_8)
                    + "&limit=" + Math.max(1, Math.min(limit, 8))
                    + "&autocomplete=1";

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "PartiKar/1.0 (contact: contact@tonsite.fr)")
                    .GET()
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return List.of();

            JsonNode root = mapper.readTree(resp.body());
            List<GeocodeResult> list = new ArrayList<>();

            for (JsonNode f : root.path("features")) {
                JsonNode props = f.path("properties");
                String city = props.path("city").asText(null);
                String postcode = props.path("postcode").asText(null);
                String label = props.path("label").asText(null);

                JsonNode geom = f.path("geometry");
                double lon = geom.path("coordinates").get(0).asDouble(0.0);
                double lat = geom.path("coordinates").get(1).asDouble(0.0);

                // Comme ton front attend :
                list.add(new GeocodeResult(label, city, postcode, "France", lat, lon, null));
            }

            cache.put(key, new CacheEntry(now, list));
            return list;

        } catch (IOException | InterruptedException e) {
            return List.of();
        }
    }
}
