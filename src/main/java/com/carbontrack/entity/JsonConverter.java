package com.carbontrack.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class JsonConverter implements AttributeConverter<Object, String> {

    private final static ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Object meta) {
        try {
            return objectMapper.writeValueAsString(meta);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    @Override
    public Object convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isEmpty()) {
                return null;
            }
            // Parse as generic Map or List
            if (dbData.trim().startsWith("[")) {
                return objectMapper.readValue(dbData, java.util.List.class);
            } else {
                return objectMapper.readValue(dbData, java.util.Map.class);
            }
        } catch (Exception ex) {
            return null;
        }
    }
}
