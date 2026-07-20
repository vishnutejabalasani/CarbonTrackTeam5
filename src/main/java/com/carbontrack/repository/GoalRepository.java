package com.carbontrack.repository;

import com.carbontrack.entity.Goal;
import com.carbontrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser(User user);

    List<Goal> findByUserAndStatus(User user, String status);

    List<Goal> findByUserOrderByStartDateDesc(User user);

    List<Goal> findByStatus(String status);
}
