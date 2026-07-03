package com.ecotracker.eco_tracker_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByActivityType(String activityType);
}
