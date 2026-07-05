package com.carbontrack.repository;

import com.carbontrack.entity.ActivityLog;
import com.carbontrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserOrderByLogDateDesc(User user);
}