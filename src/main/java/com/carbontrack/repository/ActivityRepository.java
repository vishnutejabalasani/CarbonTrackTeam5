package com.carbontrack.repository;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserOrderByLogDateDesc(User user);

    @Query("SELECT a FROM ActivityLog a WHERE a.user = :user " +
           "AND (:category IS NULL OR LOWER(a.category) = LOWER(:category)) " +
           "AND (cast(:startDate as date) IS NULL OR a.logDate >= :startDate) " +
           "AND (cast(:endDate as date) IS NULL OR a.logDate <= :endDate)")
    Page<ActivityLog> findFiltered(
            @Param("user") User user,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.user = :user AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE LOWER(a.category) = LOWER(:category) AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumEmissionsByCategoryAndDateRange(@Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.user = :user AND LOWER(a.category) = LOWER(:category) AND a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumEmissionsByUserAndCategoryAndDateRange(@Param("user") User user, @Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.user.id, SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.user.id")
    List<Object[]> sumAllUsersEmissionsInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.category, SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.category")
    List<Object[]> sumAllCategoriesEmissionsInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.logDate >= :startDate AND a.logDate <= :endDate")
    Double sumEmissionsInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.category, SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.user = :user AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.category")
    List<Object[]> aggregateEmissionsByCategory(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a.logDate, SUM(a.calculatedEmissionsKgCO2e) FROM ActivityLog a WHERE a.user = :user AND a.logDate >= :startDate AND a.logDate <= :endDate GROUP BY a.logDate ORDER BY a.logDate ASC")
    List<Object[]> aggregateEmissionsByDate(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}