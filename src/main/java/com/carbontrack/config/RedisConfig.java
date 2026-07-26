package com.carbontrack.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.cache.type:simple}")
    private String cacheType;

    @Bean
    public CacheManager cacheManager(ObjectProvider<RedisConnectionFactory> connectionFactoryProvider) {
        if ("redis".equalsIgnoreCase(cacheType)) {
            RedisConnectionFactory connectionFactory = connectionFactoryProvider.getIfAvailable();
            if (connectionFactory != null) {
                try {
                    RedisCacheConfiguration config =
                            RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofMinutes(10));

                    return RedisCacheManager.builder(connectionFactory)
                            .cacheDefaults(config)
                            .build();
                } catch (Exception e) {
                    System.err.println("Failed to initialize RedisCacheManager, falling back to in-memory ConcurrentMapCacheManager: " + e.getMessage());
                }
            }
        }
        return new ConcurrentMapCacheManager();
    }
}