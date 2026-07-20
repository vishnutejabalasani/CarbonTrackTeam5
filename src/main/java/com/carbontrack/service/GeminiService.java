package com.carbontrack.service;

import com.carbontrack.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public List<Map<String, Object>> parseNaturalLanguageLog(String text) {
        if (apiKey == null || apiKey.trim().isEmpty() || "PLACEHOLDER".equalsIgnoreCase(apiKey)) {
            System.out.println("Gemini API key is not configured. Falling back to local keyword-based fallback parser.");
            return parseFallback(text);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;

            String jsonSchema = "{"
                    + "  \"type\": \"OBJECT\","
                    + "  \"properties\": {"
                    + "    \"activities\": {"
                    + "      \"type\": \"ARRAY\","
                    + "      \"items\": {"
                    + "        \"type\": \"OBJECT\","
                    + "        \"properties\": {"
                    + "          \"category\": { \"type\": \"STRING\", \"enum\": [\"transport\", \"electricity\", \"food\", \"shopping\"] },"
                    + "          \"activityType\": { \"type\": \"STRING\" },"
                    + "          \"quantity\": { \"type\": \"NUMBER\" },"
                    + "          \"unit\": { \"type\": \"STRING\" },"
                    + "          \"logDate\": { \"type\": \"STRING\" }"
                    + "        },"
                    + "        \"required\": [\"category\", \"activityType\", \"quantity\", \"unit\", \"logDate\"]"
                    + "      }"
                    + "    }"
                    + "  }"
                    + "}";

            String prompt = "You are a specialized carbon footprint logging agent. Parse the user's input into one or more carbon activity logs. "
                    + "Map activityType exactly to these definitions if matching:\n"
                    + "- Transport: 'car_km_petrol' (unit: km), 'car_km_diesel' (unit: km), 'car_km_electric' (unit: km), 'flight_short_hours' (unit: hours), 'flight_long_hours' (unit: hours), 'bus_km' (unit: km), 'train_km' (unit: km)\n"
                    + "- Electricity: 'kwh_coal' (unit: kWh), 'kwh_gas' (unit: kWh), 'kwh_solar' (unit: kWh), 'kwh_wind' (unit: kWh)\n"
                    + "- Food: 'meal_beef' (unit: servings), 'meal_pork' (unit: servings), 'meal_chicken' (unit: servings), 'meal_fish' (unit: servings), 'meal_vegetarian' (unit: servings), 'meal_vegan' (unit: servings)\n"
                    + "- Shopping: 'clothing_purchase' (unit: amount), 'electronics_purchase' (unit: amount), 'furniture_purchase' (unit: amount)\n"
                    + "The current date is " + LocalDate.now().toString() + ". Parse relative dates (e.g. 'yesterday', 'today') accordingly.\n"
                    + "User Input: \"" + text + "\"";

            return callGeminiStructured(url, prompt, jsonSchema, "activities");
        } catch (Exception e) {
            System.err.println("Error calling Gemini API for NLP logging: " + e.getMessage());
            return parseFallback(text);
        }
    }

    public List<Map<String, Object>> generateForecast(List<Object[]> dailySum) {
        if (apiKey == null || apiKey.trim().isEmpty() || "PLACEHOLDER".equalsIgnoreCase(apiKey)) {
            return generateMockForecast();
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;

            StringBuilder history = new StringBuilder();
            for (Object[] row : dailySum) {
                history.append(row[0].toString()).append(": ").append(row[1].toString()).append(" kg, ");
            }

            String jsonSchema = "{"
                    + "  \"type\": \"OBJECT\","
                    + "  \"properties\": {"
                    + "    \"forecast\": {"
                    + "      \"type\": \"ARRAY\","
                    + "      \"items\": {"
                    + "        \"type\": \"OBJECT\","
                    + "        \"properties\": {"
                    + "          \"date\": { \"type\": \"STRING\" },"
                    + "          \"emissions\": { \"type\": \"NUMBER\" }"
                    + "        },"
                    + "        \"required\": [\"date\", \"emissions\"]"
                    + "      }"
                    + "    }"
                    + "  }"
                    + "}";

            String prompt = "You are a forecasting model. Based on the user's weekly emissions history: " + history
                    + " project the next 3 days of carbon emissions. Return a list under key 'forecast' showing 'date' (abbreviation e.g. Mon, Tue) and predicted 'emissions' values.";

            return callGeminiStructured(url, prompt, jsonSchema, "forecast");
        } catch (Exception e) {
            System.err.println("Error calling Gemini API for forecast: " + e.getMessage());
            return generateMockForecast();
        }
    }

    public String getForestGuardianMessage(double weeklyEmissions, String goalTitle, boolean onTrack) {
        if (apiKey == null || apiKey.trim().isEmpty() || "PLACEHOLDER".equalsIgnoreCase(apiKey)) {
            return "The trees sway in the wind. Log details to guide the ecosystem.";
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;

            String prompt = "You are the mythical Forest Guardian, an ancient druid protector of a virtual carbon forest. "
                    + "The user's weekly carbon emissions: " + weeklyEmissions + " kg. "
                    + "Active goal: \"" + (goalTitle != null ? goalTitle : "None") + "\". "
                    + "On track: " + onTrack + ". "
                    + "Write a short, whimsical, 1-sentence status message (max 100 characters) about the health of their forest. "
                    + "If they are doing well, be encouraging and suggest a green creature has moved in. If they are doing poorly, be playfully grumpy and mention storm clouds or wilting leaves.";

            return callGeminiPlain(url, prompt);
        } catch (Exception e) {
            return "The forest remains peaceful. Keep up the green work!";
        }
    }

    public String chatWithGreenCoach(String userMessage, double weeklyEmissions, String goalTitle) {
        if (apiKey == null || apiKey.trim().isEmpty() || "PLACEHOLDER".equalsIgnoreCase(apiKey)) {
            return "Hello! I am your AI Green Coach. Please configure the Gemini API key to unlock context-aware conversations.";
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;

            String prompt = "You are a friendly, expert AI Green Coach assisting users in carbon footprint tracking. "
                    + "The user's current weekly carbon score: " + weeklyEmissions + " kg. "
                    + "Their active goal: \"" + (goalTitle != null ? goalTitle : "None") + "\". "
                    + "User question: \"" + userMessage + "\"\n"
                    + "Give actionable, concise advice. Use markdown formatting. Keep the response to 2-3 short paragraphs.";

            return callGeminiPlain(url, prompt);
        } catch (Exception e) {
            return "I am currently offline. Please try coaching questions again later!";
        }
    }

    private List<Map<String, Object>> callGeminiStructured(String url, String prompt, String jsonSchema, String arrayKey) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", prompt);
        parts.add(partMap);
        contentMap.put("parts", parts);
        contents.add(contentMap);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("responseSchema", objectMapper.readValue(jsonSchema, Map.class));
        requestBody.put("generationConfig", generationConfig);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(20))
                .build();

        int maxRetries = 3;
        long backoffMs = 2000;
        HttpResponse<String> response = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 429 && attempt < maxRetries) {
                System.out.println("Gemini 429 rate-limited. Retrying in " + backoffMs + "ms (attempt " + attempt + "/" + maxRetries + ")...");
                Thread.sleep(backoffMs);
                backoffMs *= 2;
            } else {
                break;
            }
        }

        if (response.statusCode() == 200) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            String textResponse = rootNode.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            JsonNode parsedResult = objectMapper.readTree(textResponse);
            JsonNode arrayNode = parsedResult.path(arrayKey);
            List<Map<String, Object>> resultList = new ArrayList<>();
            if (arrayNode.isArray()) {
                for (JsonNode item : arrayNode) {
                    Map<String, Object> itemMap = objectMapper.convertValue(item, Map.class);
                    resultList.add(itemMap);
                }
            }
            return resultList;
        } else {
            throw new RuntimeException("Gemini HTTP Error " + response.statusCode() + " after " + maxRetries + " attempts");
        }
    }

    private String callGeminiPlain(String url, String prompt) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", prompt);
        parts.add(partMap);
        contentMap.put("parts", parts);
        contents.add(contentMap);
        requestBody.put("contents", contents);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(20))
                .build();

        int maxRetries = 3;
        long backoffMs = 2000;
        HttpResponse<String> response = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 429 && attempt < maxRetries) {
                System.out.println("Gemini 429 rate-limited. Retrying in " + backoffMs + "ms (attempt " + attempt + "/" + maxRetries + ")...");
                Thread.sleep(backoffMs);
                backoffMs *= 2;
            } else {
                break;
            }
        }

        if (response.statusCode() == 200) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            return rootNode.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText()
                    .trim();
        } else {
            throw new RuntimeException("Gemini HTTP Error " + response.statusCode() + " after " + maxRetries + " attempts");
        }
    }

    private List<Map<String, Object>> parseFallback(String text) {
        List<Map<String, Object>> list = new ArrayList<>();
        String lower = text.toLowerCase();
        String logDate = extractDateKeyword(lower);

        // 1. Electricity
        if (lower.contains("kwh") || lower.contains("electricity") || lower.contains("electric usage") || lower.contains("power")) {
            Map<String, Object> map = new HashMap<>();
            map.put("category", "electricity");
            double quantity = extractNumber(text, 10.0);
            map.put("quantity", quantity);
            map.put("unit", "kWh");
            map.put("logDate", logDate);

            String type = "kwh_coal";
            if (lower.contains("solar")) {
                type = "kwh_solar";
            } else if (lower.contains("gas")) {
                type = "kwh_gas";
            } else if (lower.contains("wind")) {
                type = "kwh_wind";
            }
            map.put("activityType", type);
            list.add(map);
        }

        // 2. Transport
        if (lower.contains("car") || lower.contains("drive") || lower.contains("drove") || lower.contains("km") 
                || lower.contains("mile") || lower.contains("flight") || lower.contains("fly") || lower.contains("flew")
                || lower.contains("bus") || lower.contains("train") || lower.contains("travel")) {
            
            Map<String, Object> map = new HashMap<>();
            map.put("category", "transport");
            double quantity = extractNumber(text, 25.0);
            map.put("quantity", quantity);
            map.put("logDate", logDate);

            String type = "car_km_petrol";
            String unit = "km";

            if (lower.contains("flight") || lower.contains("fly") || lower.contains("flew")) {
                unit = "hours";
                type = quantity > 5 ? "flight_long_hours" : "flight_short_hours";
            } else if (lower.contains("bus")) {
                type = "bus_km";
            } else if (lower.contains("train")) {
                type = "train_km";
            } else if (lower.contains("electric")) {
                type = "car_km_electric";
            } else if (lower.contains("diesel")) {
                type = "car_km_diesel";
            }
            
            map.put("unit", unit);
            map.put("activityType", type);
            list.add(map);
        }

        // 3. Food
        if (lower.contains("beef") || lower.contains("steak") || lower.contains("pork") || lower.contains("chicken") 
                || lower.contains("fish") || lower.contains("vegetarian") || lower.contains("veg") || lower.contains("vegan") 
                || lower.contains("salad") || lower.contains("meal") || lower.contains("ate") || lower.contains("food")
                || lower.contains("consumed food")) {
            
            Map<String, Object> map = new HashMap<>();
            map.put("category", "food");
            double quantity = extractNumber(text, 1.0);
            map.put("quantity", quantity);
            map.put("unit", "servings");
            map.put("logDate", logDate);

            String type = "meal_vegetarian";
            if (lower.contains("beef") || lower.contains("steak")) {
                type = "meal_beef";
            } else if (lower.contains("pork")) {
                type = "meal_pork";
            } else if (lower.contains("chicken")) {
                type = "meal_chicken";
            } else if (lower.contains("fish")) {
                type = "meal_fish";
            } else if (lower.contains("vegan")) {
                type = "meal_vegan";
            }
            
            map.put("activityType", type);
            list.add(map);
        }

        // 4. Shopping
        if (lower.contains("bought") || lower.contains("purchase") || lower.contains("shop") || lower.contains("shopping") 
                || lower.contains("clothing") || lower.contains("clothes") || lower.contains("tshirt") || lower.contains("electronics") 
                || lower.contains("phone") || lower.contains("computer") || lower.contains("laptop") || lower.contains("furniture") 
                || lower.contains("chair") || lower.contains("table") || lower.contains("goods")) {
            
            Map<String, Object> map = new HashMap<>();
            map.put("category", "shopping");
            double quantity = extractNumber(text, 50.0);
            map.put("quantity", quantity);
            map.put("unit", "amount");
            map.put("logDate", logDate);

            String type = "household_goods";
            if (lower.contains("clothing") || lower.contains("clothes") || lower.contains("tshirt")) {
                type = "clothing_purchase";
            } else if (lower.contains("electronics") || lower.contains("phone") || lower.contains("computer") || lower.contains("laptop")) {
                type = "electronics_purchase";
            } else if (lower.contains("furniture") || lower.contains("chair") || lower.contains("table")) {
                type = "furniture_purchase";
            }
            
            map.put("activityType", type);
            list.add(map);
        }

        return list;
    }

    private List<Map<String, Object>> generateMockForecast() {
        List<Map<String, Object>> list = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed"};
        double[] vals = {15.0, 12.0, 10.0};
        for (int i = 0; i < days.length; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", days[i]);
            map.put("emissions", vals[i]);
            list.add(map);
        }
        return list;
    }

    private double extractNumber(String text, double defaultValue) {
        try {
            String cleaned = text.replaceAll("[^0-9.]", " ").trim();
            String[] tokens = cleaned.split("\\s+");
            for (String t : tokens) {
                if (!t.isEmpty()) {
                    return Double.parseDouble(t);
                }
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }

    private String extractDateKeyword(String lower) {
        if (lower.contains("yesterday")) {
            return LocalDate.now().minusDays(1).toString();
        }
        return LocalDate.now().toString();
    }
}
