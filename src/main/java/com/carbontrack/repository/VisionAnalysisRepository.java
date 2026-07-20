package com.carbontrack.repository;

import com.carbontrack.entity.User;
import com.carbontrack.entity.VisionAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VisionAnalysisRepository extends JpaRepository<VisionAnalysis, Long> {
    List<VisionAnalysis> findByUserOrderByCreatedAtDesc(User user);
}
