package com.ecotracker.eco_tracker_backend;

import org.flywaydb.core.Flyway;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;

@SpringBootApplication
public class EcoTrackerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcoTrackerBackendApplication.class, args);
	}

	@Bean
	public Flyway flyway(DataSource dataSource) {
		Flyway flyway = Flyway.configure()
				.dataSource(dataSource)
				.locations("classpath:db/migration")
				.baselineOnMigrate(true)
				.load();
		flyway.migrate();
		return flyway;
	}

	@Bean
	public static org.springframework.beans.factory.config.BeanFactoryPostProcessor entityManagerFactoryDependsOnFlywayPostProcessor() {
		return beanFactory -> {
			if (beanFactory.containsBeanDefinition("entityManagerFactory")) {
				org.springframework.beans.factory.config.BeanDefinition emfbDef =
						beanFactory.getBeanDefinition("entityManagerFactory");
				String[] dependsOn = emfbDef.getDependsOn();
				if (dependsOn == null) {
					dependsOn = new String[]{"flyway"};
				} else {
					String[] newDependsOn = new String[dependsOn.length + 1];
					System.arraycopy(dependsOn, 0, newDependsOn, 0, dependsOn.length);
					newDependsOn[dependsOn.length] = "flyway";
					dependsOn = newDependsOn;
				}
				emfbDef.setDependsOn(dependsOn);
			}
		};
	}
}
