package com.carbontrack.service;

import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.entity.User;
import com.carbontrack.entity.VisionAnalysis;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.repository.VisionAnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.time.Duration;
import java.util.*;

@Service
public class VisionService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    private final EmissionFactorRepository emissionFactorRepository;
    private final VisionAnalysisRepository visionAnalysisRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Mapping from Gemini-detected activity descriptions → database activity_type codes
    private static final Map<String, String> ITEM_TO_ACTIVITY_TYPE = new LinkedHashMap<>();
    static {
        // Transport
        ITEM_TO_ACTIVITY_TYPE.put("petrol car", "car_km_petrol");
        ITEM_TO_ACTIVITY_TYPE.put("diesel car", "car_km_diesel");
        ITEM_TO_ACTIVITY_TYPE.put("electric car", "car_km_electric");
        ITEM_TO_ACTIVITY_TYPE.put("ev", "car_km_electric");
        ITEM_TO_ACTIVITY_TYPE.put("car", "car_km_petrol");
        ITEM_TO_ACTIVITY_TYPE.put("bus", "public_transit_km");
        ITEM_TO_ACTIVITY_TYPE.put("public transit", "public_transit_km");
        ITEM_TO_ACTIVITY_TYPE.put("train", "public_transit_km");
        ITEM_TO_ACTIVITY_TYPE.put("metro", "public_transit_km");
        ITEM_TO_ACTIVITY_TYPE.put("short-haul flight", "flight_short_hours");
        ITEM_TO_ACTIVITY_TYPE.put("long-haul flight", "flight_long_hours");
        ITEM_TO_ACTIVITY_TYPE.put("flight", "flight_short_hours");
        ITEM_TO_ACTIVITY_TYPE.put("airplane", "flight_short_hours");
        ITEM_TO_ACTIVITY_TYPE.put("plane", "flight_short_hours");

        // Food
        ITEM_TO_ACTIVITY_TYPE.put("beef", "meal_beef");
        ITEM_TO_ACTIVITY_TYPE.put("steak", "meal_beef");
        ITEM_TO_ACTIVITY_TYPE.put("beef burger", "meal_beef");
        ITEM_TO_ACTIVITY_TYPE.put("burger", "meal_beef");
        ITEM_TO_ACTIVITY_TYPE.put("chicken", "meal_chicken");
        ITEM_TO_ACTIVITY_TYPE.put("poultry", "meal_chicken");
        ITEM_TO_ACTIVITY_TYPE.put("vegetarian", "meal_vegetarian");
        ITEM_TO_ACTIVITY_TYPE.put("salad", "meal_vegetarian");
        ITEM_TO_ACTIVITY_TYPE.put("vegan", "meal_vegan");
        ITEM_TO_ACTIVITY_TYPE.put("meal", "meal_chicken");
        ITEM_TO_ACTIVITY_TYPE.put("food", "meal_chicken");
        ITEM_TO_ACTIVITY_TYPE.put("restaurant", "meal_chicken");

        // Electricity
        ITEM_TO_ACTIVITY_TYPE.put("grid average", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("coal power", "kwh_coal");
        ITEM_TO_ACTIVITY_TYPE.put("natural gas", "kwh_natural_gas");
        ITEM_TO_ACTIVITY_TYPE.put("renewable", "kwh_renewable");
        ITEM_TO_ACTIVITY_TYPE.put("laptop", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("computer", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("desktop", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("ac", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("air conditioner", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("fan", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("light", "kwh_grid_avg");
        ITEM_TO_ACTIVITY_TYPE.put("appliance", "kwh_grid_avg");

        // Shopping
        ITEM_TO_ACTIVITY_TYPE.put("clothing", "clothing_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("clothes", "clothing_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("shirt", "clothing_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("electronics", "electronics_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("phone", "electronics_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("mobile", "electronics_purchase");
        ITEM_TO_ACTIVITY_TYPE.put("shopping", "household_goods");
        ITEM_TO_ACTIVITY_TYPE.put("household", "household_goods");
        ITEM_TO_ACTIVITY_TYPE.put("plastic", "household_goods");
        ITEM_TO_ACTIVITY_TYPE.put("bottle", "household_goods");
        ITEM_TO_ACTIVITY_TYPE.put("grocery", "household_goods");
    }

    public VisionService(EmissionFactorRepository emissionFactorRepository,
                         VisionAnalysisRepository visionAnalysisRepository) {
        this.emissionFactorRepository = emissionFactorRepository;
        this.visionAnalysisRepository = visionAnalysisRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private byte[] compressImage(byte[] imageBytes, String formatName) {
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
            BufferedImage originalImage = ImageIO.read(bais);
            if (originalImage == null) return imageBytes;

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            String targetFormat = formatName.toLowerCase().contains("png") ? "png" : "jpeg";

            if ("jpeg".equals(targetFormat)) {
                Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
                if (writers.hasNext()) {
                    ImageWriter writer = writers.next();
                    ImageOutputStream ios = ImageIO.createImageOutputStream(baos);
                    writer.setOutput(ios);

                    ImageWriteParam param = writer.getDefaultWriteParam();
                    if (param.canWriteCompressed()) {
                        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                        param.setCompressionQuality(0.7f); // Compress to 70% quality
                    }

                    writer.write(null, new IIOImage(originalImage, null, null), param);
                    writer.dispose();
                    ios.close();
                    return baos.toByteArray();
                }
            }

            ImageIO.write(originalImage, targetFormat, baos);
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Image compression failed: " + e.getMessage());
            return imageBytes;
        }
    }

    /**
     * Analyze an image and calculate carbon footprint using Gemini Vision API and database emission factors.
     */
    public VisionAnalysis analyzeImage(User user, byte[] imageBytes, String mimeType, String fileName) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty() || "PLACEHOLDER".equalsIgnoreCase(apiKey)) {
            throw new RuntimeException("Gemini API key is not configured. Please set app.gemini.api-key in application.properties.");
        }

        // Compress image first
        byte[] compressedBytes = compressImage(imageBytes, mimeType);

        // Save image to the local uploads directory
        String fileExtension = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : ".jpg";
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        File uploadsDir = new File("uploads");
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }
        File targetFile = new File(uploadsDir, uniqueFileName);
        Files.write(targetFile.toPath(), compressedBytes);
        String imageUrl = "/uploads/" + uniqueFileName;

        // Step 1: Call Gemini Vision API
        Map<String, Object> geminiResponse = callGeminiVision(compressedBytes, mimeType);
        String summary = (String) geminiResponse.getOrDefault("summary", "No activities detected.");
        List<Map<String, Object>> activities = (List<Map<String, Object>>) geminiResponse.getOrDefault("activities", Collections.emptyList());

        // Step 2: Map to emission factors and calculate carbon
        List<Map<String, Object>> enrichedActivities = new ArrayList<>();
        double totalCarbon = 0.0;
        Map<String, Double> categoryBreakdown = new LinkedHashMap<>();

        for (Map<String, Object> activity : activities) {
            String activityDesc = ((String) activity.getOrDefault("activity", "")).toLowerCase().trim();
            String category = ((String) activity.getOrDefault("category", "Other")).toLowerCase().trim();
            double confidence = activity.containsKey("confidence")
                    ? ((Number) activity.get("confidence")).doubleValue()
                    : 0.7;

            double quantity = activity.containsKey("quantity") 
                    ? ((Number) activity.get("quantity")).doubleValue() 
                    : 1.0;
            String unit = (String) activity.getOrDefault("unit", "servings");

            String activityType = resolveActivityType(activityDesc, category);

            double emissionFactor = 0.0;
            String dbCategory = category;
            String dbUnit = unit;

            Optional<EmissionFactor> factorOpt = emissionFactorRepository.findByActivityTypeAndIsActiveTrue(activityType);
            if (factorOpt.isPresent()) {
                EmissionFactor ef = factorOpt.get();
                emissionFactor = ef.getEmissionValueKgCO2e();
                dbCategory = ef.getCategory();
                dbUnit = ef.getUnit();
            }

            double estimatedCarbon = quantity * emissionFactor;
            totalCarbon += estimatedCarbon;

            String displayCategory = capitalize(dbCategory);
            categoryBreakdown.merge(displayCategory, estimatedCarbon, Double::sum);

            Map<String, Object> enriched = new LinkedHashMap<>();
            enriched.put("activity", activity.getOrDefault("activity", activityDesc));
            enriched.put("category", displayCategory);
            enriched.put("activityType", activityType);
            enriched.put("quantity", quantity);
            enriched.put("unit", dbUnit);
            enriched.put("emissionFactor", emissionFactor);
            enriched.put("estimatedCarbonKg", Math.round(estimatedCarbon * 100.0) / 100.0);
            enriched.put("confidence", confidence);
            enrichedActivities.add(enriched);
        }

        // Step 3: Generate recommendations
        List<String> recommendations = generateRecommendations(enrichedActivities);

        // Step 4: Get overall summary and title
        String title = enrichedActivities.isEmpty() ? "Image Analysis"
                : "Analysis: " + enrichedActivities.stream()
                    .map(a -> (String) a.get("activity"))
                    .filter(Objects::nonNull)
                    .limit(3)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Image");

        // Step 5: Save VisionAnalysis record in the database
        VisionAnalysis analysis = VisionAnalysis.builder()
                .user(user)
                .imageName(imageUrl)
                .title(title)
                .summary(summary)
                .detectedActivities(enrichedActivities)
                .carbonBreakdown(categoryBreakdown)
                .recommendations(recommendations)
                .overallConfidence(activities.isEmpty() ? 0.0
                        : enrichedActivities.stream()
                            .mapToDouble(a -> ((Number) a.get("confidence")).doubleValue())
                            .average()
                            .orElse(0.0))
                .totalEstimatedKgCO2e(Math.round(totalCarbon * 100.0) / 100.0)
                .userEdits(new LinkedHashMap<String, Object>())
                .status("completed")
                .build();

        return visionAnalysisRepository.save(analysis);
    }

    /**
     * Get vision analysis history for a user.
     */
    public List<VisionAnalysis> getUserHistory(User user) {
        return visionAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Update/Save edited version of a vision analysis.
     */
    public VisionAnalysis updateAnalysisEdits(Long analysisId, User user, Map<String, Object> updates) {
        VisionAnalysis analysis = visionAnalysisRepository.findById(analysisId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis report not found."));

        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized to modify this analysis report.");
        }

        if (updates.containsKey("detectedActivities")) {
            analysis.setDetectedActivities(updates.get("detectedActivities"));
        }
        if (updates.containsKey("totalEstimatedKgCO2e")) {
            analysis.setTotalEstimatedKgCO2e(((Number) updates.get("totalEstimatedKgCO2e")).doubleValue());
        }
        if (updates.containsKey("carbonBreakdown")) {
            analysis.setCarbonBreakdown(updates.get("carbonBreakdown"));
        }
        if (updates.containsKey("userEdits")) {
            analysis.setUserEdits(updates.get("userEdits"));
        }
        if (updates.containsKey("status")) {
            analysis.setStatus((String) updates.get("status"));
        }

        return visionAnalysisRepository.save(analysis);
    }

    private Map<String, Object> callGeminiVision(byte[] imageBytes, String mimeType) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String prompt = "You are an environmental sustainability analyst specializing in carbon footprint detection. "
                + "Analyze the uploaded image carefully. "
                + "Identify EVERY activity, object, appliance, food item, vehicle, waste, or context visible that contributes to carbon emissions. "
                + "Estimate quantities whenever possible (e.g., distances in km, energy in kWh, number of meals/servings, amounts for purchases). "
                + "Do NOT hallucinate or guess things not visible. Only report what you can see or reasonably infer. "
                + "Do NOT calculate emissions yourself - only identify activities and estimate quantities. "
                + "Focus on: transportation, food, electricity usage, manufacturing, waste, travel, appliances, industrial equipment, consumer products, and lifestyle activities.";

        String jsonSchema = "{"
                + "\"type\": \"OBJECT\","
                + "\"properties\": {"
                + "  \"summary\": { \"type\": \"STRING\" },"
                + "  \"activities\": {"
                + "    \"type\": \"ARRAY\","
                + "    \"items\": {"
                + "      \"type\": \"OBJECT\","
                + "      \"properties\": {"
                + "        \"category\": { \"type\": \"STRING\", \"enum\": [\"Transportation\", \"Food\", \"Electricity\", \"Shopping\", \"Waste\", \"Industrial\", \"Other\"] },"
                + "        \"activity\": { \"type\": \"STRING\" },"
                + "        \"quantity\": { \"type\": \"NUMBER\" },"
                + "        \"unit\": { \"type\": \"STRING\" },"
                + "        \"confidence\": { \"type\": \"NUMBER\" }"
                + "      },"
                + "      \"required\": [\"category\", \"activity\", \"quantity\", \"unit\", \"confidence\"]"
                + "    }"
                + "  }"
                + "}"
                + "}";

        Map<String, Object> requestBody = new LinkedHashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new LinkedHashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        Map<String, Object> imagePart = new LinkedHashMap<>();
        Map<String, Object> inlineData = new LinkedHashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);
        imagePart.put("inlineData", inlineData);
        parts.add(imagePart);

        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("responseSchema", objectMapper.readValue(jsonSchema, Map.class));
        requestBody.put("generationConfig", generationConfig);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(30))
                .build();

        int maxRetries = 3;
        long backoffMs = 2000;
        HttpResponse<String> response = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 429 && attempt < maxRetries) {
                System.out.println("Gemini Vision 429. Retrying in " + backoffMs + "ms (attempt " + attempt + ")...");
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

            @SuppressWarnings("unchecked")
            Map<String, Object> parsedResult = objectMapper.readValue(textResponse, Map.class);
            return parsedResult;
        } else {
            System.err.println("Gemini Vision Error " + response.statusCode() + ": " + response.body());
            throw new RuntimeException("Gemini Vision API Error: HTTP " + response.statusCode());
        }
    }

    private String resolveActivityType(String activity, String category) {
        String lowerAct = activity.toLowerCase();
        if (ITEM_TO_ACTIVITY_TYPE.containsKey(lowerAct)) {
            return ITEM_TO_ACTIVITY_TYPE.get(lowerAct);
        }
        for (Map.Entry<String, String> entry : ITEM_TO_ACTIVITY_TYPE.entrySet()) {
            if (lowerAct.contains(entry.getKey()) || entry.getKey().contains(lowerAct)) {
                return entry.getValue();
            }
        }
        switch (category.toLowerCase()) {
            case "transportation": 
            case "transport": 
                return "car_km_petrol";
            case "food": 
                return "meal_chicken";
            case "electricity": 
                return "kwh_grid_avg";
            case "shopping": 
                return "household_goods";
            default: 
                return "kwh_grid_avg";
        }
    }

    private List<String> generateRecommendations(List<Map<String, Object>> activities) {
        List<String> recs = new ArrayList<>();
        for (Map<String, Object> activity : activities) {
            String actName = ((String) activity.getOrDefault("activity", "")).toLowerCase();
            String category = ((String) activity.getOrDefault("category", "")).toLowerCase();

            if (actName.contains("beef") || actName.contains("steak") || actName.contains("burger")) {
                recs.add("Consider switching beef to chicken or plant-based alternatives to reduce emissions by up to 80%.");
            }
            if (actName.contains("car") && !actName.contains("electric")) {
                recs.add("Consider using public transport, cycling, or carpooling to reduce transport emissions.");
            }
            if (actName.contains("flight") || actName.contains("airplane") || actName.contains("plane")) {
                recs.add("Where possible, prefer rail travel over flights for short distances. One short flight emits ~90 kg CO₂.");
            }
            if (category.contains("electricity") || actName.contains("ac") || actName.contains("laptop") || actName.contains("light")) {
                recs.add("Turn off appliances when not in use and switch to energy-efficient LED lighting.");
            }
            if (actName.contains("plastic") || actName.contains("bottle") || actName.contains("waste")) {
                recs.add("Switch to reusable bottles and bags to minimize plastic waste and manufacturing emissions.");
            }
            if (actName.contains("shopping") || actName.contains("clothing") || actName.contains("clothes")) {
                recs.add("Consider buying second-hand or sustainable fashion to lower the carbon cost of new manufacturing.");
            }
        }
        return new ArrayList<>(new LinkedHashSet<>(recs));
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }
}
