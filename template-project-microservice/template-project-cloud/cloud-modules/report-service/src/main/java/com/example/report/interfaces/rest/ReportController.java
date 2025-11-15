package com.example.report.interfaces.rest;

import com.example.core.common.result.Result;
import com.example.report.application.dto.PageResult;
import com.example.report.application.dto.ReportDTO;
import com.example.report.application.dto.TemplateDTO;
import com.example.report.application.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 报表控制器
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping
    public Result<PageResult<ReportDTO>> getReportList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        PageResult<ReportDTO> result = reportService.getReportList(pageNum, pageSize, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<ReportDTO> getReportById(@PathVariable String id) {
        ReportDTO report = reportService.getReportById(id);
        return Result.success(report);
    }

    @PostMapping
    public Result<ReportDTO> createReport(@RequestBody Map<String, Object> params) {
        ReportDTO report = reportService.generateReport(
                (String) params.get("templateId"),
                params
        );
        return Result.success(report);
    }

    @PostMapping("/generate/{templateId}")
    public Result<ReportDTO> generateReport(@PathVariable String templateId, @RequestBody Map<String, Object> params) {
        ReportDTO report = reportService.generateReport(templateId, params);
        return Result.success(report);
    }

    @GetMapping("/templates")
    public Result<List<TemplateDTO>> getTemplates() {
        List<TemplateDTO> templates = reportService.getTemplates();
        return Result.success(templates);
    }

    @GetMapping("/{id}/export")
    public Result<Void> exportReport(@PathVariable String id, @RequestParam(defaultValue = "excel") String format) {
        // 导出功能暂时不实现
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        return Result.success();
    }
}



