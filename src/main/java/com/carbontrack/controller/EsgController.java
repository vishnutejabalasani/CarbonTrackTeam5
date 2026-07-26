package com.carbontrack.controller;

import com.carbontrack.entity.EsgReport;
import com.carbontrack.service.EsgService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/esg", "/esg"})
public class EsgController {

    private final EsgService esgService;

    public EsgController(EsgService esgService) {
        this.esgService = esgService;
    }

    @GetMapping({"/report/{id}", "/report"})
    public ResponseEntity<EsgReport> getEsgReport(@PathVariable(required = false) Long id) {
        return ResponseEntity.ok(esgService.getReportById(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<EsgReport>> getEsgReportHistory() {
        return ResponseEntity.ok(esgService.getReportHistory());
    }

    @PostMapping("/generate")
    public ResponseEntity<EsgReport> generateNewReport() {
        return ResponseEntity.ok(esgService.generateAndSaveReport());
    }

    @GetMapping("/export/pdf/{id}")
    public ResponseEntity<EsgReport> getExportPdfData(@PathVariable Long id) {
        EsgReport report = esgService.getReportById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ESG_Report_" + id + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(report);
    }

    @GetMapping("/export/excel/{id}")
    public ResponseEntity<EsgReport> getExportExcelData(@PathVariable Long id) {
        EsgReport report = esgService.getReportById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ESG_Report_" + id + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(report);
    }
}
