package com.partikar.geocode;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service minimal pour interroger Nominatim (OpenStreetMap) avec un cache en mémoire.
 * Usage: prototype/dev rapide et gratuit. Respectez les limites d'utilisation de Nominatim.
 */
@Service
public class GeocodeService {

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    // Cache simple : query -> (timestamp, json)
    private static class CacheEntry {
        final long ts;
        final List<GeocodeResult> results;

        CacheEntry(long ts, List<GeocodeResult> results) {
            this.ts = ts;
            this.results = results;
        }
    }

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long ttlMillis = 5 * 60 * 1000; // 5 minutes

    public List<GeocodeResult> search(String q, int limit) {
        if (q == null) return List.of();
        String key = q.trim().toLowerCase() + "|" + limit;
        CacheEntry cached = cache.get(key);
        long now = Instant.now().toEpochMilli();
        if (cached != null && (now - cached.ts) < ttlMillis) {
            return cached.results;
        }

        try {
            String url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=" + limit + "&q=" + java.net.URLEncoder.encode(q, java.nio.charset.StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "PartiKar-Dev/1.0 (contact: dev@example.com)")
                    .header("Accept-Language", "fr")
                    .GET()
                    .build();

            HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return List.of();
            }

            JsonNode root = mapper.readTree(resp.body());
            List<GeocodeResult> results = new ArrayList<>();
            for (JsonNode node : root) {
                String display = node.path("display_name").asText(null);
                double lat = node.path("lat").asDouble(0.0);
                double lon = node.path("lon").asDouble(0.0);
                JsonNode addr = node.path("address");
                String city = null;
                if (addr.has("city")) city = addr.get("city").asText();
                else if (addr.has("town")) city = addr.get("town").asText();
                else if (addr.has("village")) city = addr.get("village").asText();
                else if (addr.has("county")) city = addr.get("county").asText();
                String postcode = addr.has("postcode") ? addr.get("postcode").asText() : null;
                String country = addr.has("country") ? addr.get("country").asText() : null;
                String osmId = node.path("osm_id").asText("");

                GeocodeResult r = new GeocodeResult(display, city, postcode, country, lat, lon, osmId);
                results.add(r);
            }

            cache.put(key, new CacheEntry(now, results));
            return results;
        } catch (IOException | InterruptedException e) {
            // En cas d'erreur, retourner une liste vide
            return List.of();
        }
    }
}

