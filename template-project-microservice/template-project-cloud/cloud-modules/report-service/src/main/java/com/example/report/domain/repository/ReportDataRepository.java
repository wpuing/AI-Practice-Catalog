package com.example.report.domain.repository;

import com.example.report.domain.entity.ReportData;

import java.util.List;

/**
 * 报表数据仓储接口
 */
public interface ReportDataRepository {
    ReportData findById(String id);
    List<ReportData> findList(int pageNum, int pageSize, String keyword);
    long count(String keyword);
    void save(ReportData report);
    void update(ReportData report);
    void delete(String id);
}



