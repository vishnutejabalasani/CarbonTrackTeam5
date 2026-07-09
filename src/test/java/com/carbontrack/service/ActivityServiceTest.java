package com.carbontrack.service;

import com.carbontrack.dto.LogActivityRequest;
import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.EmissionFactor;
import com.carbontrack.entity.User;
import com.carbontrack.repository.ActivityRepository;
import com.carbontrack.repository.EmissionFactorRepository;
import com.carbontrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @Mock
    private com.carbontrack.repository.GoalRepository goalRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ActivityService activityService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .build();

        // Setup security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    @ParameterizedTest
    @CsvSource({
            "transport, car_km_petrol, km, 10.0, 0.21, 2.10",
            "transport, flight_short_hours, hours, 2.0, 90.5, 181.0",
            "electricity, kwh_coal, kWh, 100.0, 0.95, 95.0",
            "food, meal_beef, servings, 3.0, 6.61, 19.83",
            "shopping, clothing_purchase, amount, 50.0, 0.12, 6.00"
    })
    void testCalculateEmissions_Parameterized(String category, String activityType, String unit, 
                                             double quantity, double factorValue, double expectedEmissions) {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory(category);
        request.setActivityType(activityType);
        request.setQuantity(quantity);
        request.setUnit(unit);
        request.setLogDate(LocalDate.now());

        EmissionFactor mockFactor = EmissionFactor.builder()
                .category(category)
                .activityType(activityType)
                .unit(unit)
                .emissionValueKgCO2e(factorValue)
                .isActive(true)
                .build();

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue(activityType))
                .thenReturn(Optional.of(mockFactor));

        when(activityRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ActivityLog result = activityService.logActivity(request);

        // Assert
        assertNotNull(result);
        assertEquals(expectedEmissions, result.getCalculatedEmissionsKgCO2e(), 0.001);
        assertEquals(category, result.getCategory());
        assertEquals(activityType, result.getActivityType());
        assertEquals(unit, result.getUnit());
    }

    @Test
    void testCalculateEmissions_BoundaryCases_ZeroQuantity() {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory("transport");
        request.setActivityType("car_km_petrol");
        request.setQuantity(0.0); // boundary: zero
        request.setUnit("km");
        request.setLogDate(LocalDate.now());

        EmissionFactor mockFactor = EmissionFactor.builder()
                .category("transport")
                .activityType("car_km_petrol")
                .unit("km")
                .emissionValueKgCO2e(0.21)
                .isActive(true)
                .build();

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue("car_km_petrol"))
                .thenReturn(Optional.of(mockFactor));

        when(activityRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ActivityLog result = activityService.logActivity(request);

        // Assert
        assertNotNull(result);
        assertEquals(0.0, result.getCalculatedEmissionsKgCO2e());
    }

    @Test
    void testCalculateEmissions_BoundaryCases_MaxQuantity() {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory("electricity");
        request.setActivityType("kwh_coal");
        request.setQuantity(Double.MAX_VALUE);
        request.setUnit("kWh");
        request.setLogDate(LocalDate.now());

        EmissionFactor mockFactor = EmissionFactor.builder()
                .category("electricity")
                .activityType("kwh_coal")
                .unit("kWh")
                .emissionValueKgCO2e(0.95)
                .isActive(true)
                .build();

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue("kwh_coal"))
                .thenReturn(Optional.of(mockFactor));

        when(activityRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ActivityLog result = activityService.logActivity(request);

        // Assert
        assertNotNull(result);
        assertEquals(Double.MAX_VALUE * 0.95, result.getCalculatedEmissionsKgCO2e());
    }

    @Test
    void testCalculateEmissions_UnknownActivityType_ShouldThrow() {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory("transport");
        request.setActivityType("space_shuttle");
        request.setQuantity(1.0);
        request.setUnit("km");
        request.setLogDate(LocalDate.now());

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue("space_shuttle"))
                .thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            activityService.logActivity(request);
        });
        assertTrue(exception.getMessage().contains("Unknown or inactive activity type"));
    }

    @Test
    void testCalculateEmissions_MismatchCategory_ShouldThrow() {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory("food"); // Mismatch: should be transport
        request.setActivityType("car_km_petrol");
        request.setQuantity(10.0);
        request.setUnit("km");
        request.setLogDate(LocalDate.now());

        EmissionFactor mockFactor = EmissionFactor.builder()
                .category("transport")
                .activityType("car_km_petrol")
                .unit("km")
                .emissionValueKgCO2e(0.21)
                .isActive(true)
                .build();

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue("car_km_petrol"))
                .thenReturn(Optional.of(mockFactor));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            activityService.logActivity(request);
        });
        assertTrue(exception.getMessage().contains("belongs to category"));
    }

    @Test
    void testCalculateEmissions_MismatchUnit_ShouldThrow() {
        // Arrange
        LogActivityRequest request = new LogActivityRequest();
        request.setCategory("transport");
        request.setActivityType("car_km_petrol");
        request.setQuantity(10.0);
        request.setUnit("miles"); // Mismatch: should be km
        request.setLogDate(LocalDate.now());

        EmissionFactor mockFactor = EmissionFactor.builder()
                .category("transport")
                .activityType("car_km_petrol")
                .unit("km")
                .emissionValueKgCO2e(0.21)
                .isActive(true)
                .build();

        when(emissionFactorRepository.findByActivityTypeAndIsActiveTrue("car_km_petrol"))
                .thenReturn(Optional.of(mockFactor));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            activityService.logActivity(request);
        });
        assertTrue(exception.getMessage().contains("Invalid unit"));
    }
}
