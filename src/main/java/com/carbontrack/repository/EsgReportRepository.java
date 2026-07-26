package com.carbontrack.repository;

import com.carbontrack.entity.EsgReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EsgReportRepository extends JpaRepository<EsgReport, Long> {
    List<EsgReport> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<EsgReport> findByUserId(Long userId);
}
