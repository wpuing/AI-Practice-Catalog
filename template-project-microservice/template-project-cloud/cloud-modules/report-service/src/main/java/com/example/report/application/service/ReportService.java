package com.example.report.application.service;

import com.example.core.common.exception.BusinessException;
import com.example.core.common.result.ResultCode;
import com.example.report.application.dto.PageResult;
import com.example.report.application.dto.ReportDTO;
import com.example.report.application.dto.TemplateDTO;
import com.example.report.domain.entity.ReportData;
import com.example.report.domain.entity.ReportTemplate;
import com.example.report.domain.repository.ReportDataRepository;
import com.example.report.infrastructure.repository.mapper.ReportTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 报表服务
 */
@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportDataRepository reportDataRepository;
    private final ReportTemplateMapper reportTemplateMapper;

    public PageResult<ReportDTO> getReportList(int pageNum, int pageSize, String keyword) {
        List<ReportData> reports = reportDataRepository.findList(pageNum, pageSize, keyword);
        long total = reportDataRepository.count(keyword);

        List<ReportDTO> reportDTOs = reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageResult<>(reportDTOs, total, pageNum, pageSize);
    }

    public ReportDTO getReportById(String id) {
        ReportData report = reportDataRepository.findById(id);
        if (report == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "报表不存在");
        }
        return convertToDTO(report);
    }

    @Transactional
    public ReportDTO generateReport(String templateId, Map<String, Object> params) {
        // 查询模板
        ReportTemplate template = reportTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "模板不存在");
        }

        ReportData report = new ReportData();
        report.setTemplateId(templateId);
        report.setReportName((String) params.getOrDefault("reportName", "报表_" + System.currentTimeMillis()));
        report.setReportStatus("COMPLETED");
        report.setReportData("{}");
        report.setCreateDate(LocalDateTime.now());
        report.setCreateUser("system");
        report.setDeleted(0);
        report.setDbVersion(1);

        reportDataRepository.save(report);
        return convertToDTO(report);
    }

    public List<TemplateDTO> getTemplates() {
        List<ReportTemplate> templates = reportTemplateMapper.selectList(null);
        return templates.stream()
                .map(t -> {
                    TemplateDTO dto = new TemplateDTO();
                    dto.setId(t.getId());
                    dto.setName(t.getTemplateName());
                    dto.setTemplateName(t.getTemplateName());
                    dto.setTemplateCode(t.getTemplateCode());
                    dto.setTemplateType(t.getTemplateType());
                    dto.setDescription(t.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReport(String id) {
        ReportData report = reportDataRepository.findById(id);
        if (report == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "报表不存在");
        }
        reportDataRepository.delete(id);
    }

    private ReportDTO convertToDTO(ReportData report) {
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setReportName(report.getReportName());
        // reportType 和 description 从模板中获取
        ReportTemplate template = reportTemplateMapper.selectById(report.getTemplateId());
        if (template != null) {
            dto.setReportType(template.getTemplateType());
            dto.setTemplateName(template.getTemplateName());
            dto.setDescription(template.getDescription());
        }
        dto.setTemplateId(report.getTemplateId());
        dto.setStatus(report.getReportStatus());
        dto.setCreateDate(report.getCreateDate());
        dto.setUpdateDate(report.getUpdateDate());
        return dto;
    }
}



