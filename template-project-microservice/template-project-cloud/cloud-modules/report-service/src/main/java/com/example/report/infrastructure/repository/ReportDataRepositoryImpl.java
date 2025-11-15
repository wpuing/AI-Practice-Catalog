package com.example.report.infrastructure.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.report.domain.entity.ReportData;
import com.example.report.domain.repository.ReportDataRepository;
import com.example.report.infrastructure.repository.mapper.ReportDataMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 报表数据仓储实现
 */
@Repository
@RequiredArgsConstructor
public class ReportDataRepositoryImpl implements ReportDataRepository {
    private final ReportDataMapper reportDataMapper;

    @Override
    public ReportData findById(String id) {
        return reportDataMapper.selectOne(
                new LambdaQueryWrapper<ReportData>()
                        .eq(ReportData::getId, id)
                        .eq(ReportData::getDeleted, 0)
        );
    }

    @Override
    public List<ReportData> findList(int pageNum, int pageSize, String keyword) {
        LambdaQueryWrapper<ReportData> wrapper = new LambdaQueryWrapper<ReportData>()
                .eq(ReportData::getDeleted, 0)
                .orderByDesc(ReportData::getCreateDate);

        if (StringUtils.hasText(keyword)) {
            wrapper.like(ReportData::getReportName, keyword);
        }

        Page<ReportData> page = new Page<>(pageNum, pageSize);
        Page<ReportData> result = reportDataMapper.selectPage(page, wrapper);
        return result.getRecords();
    }

    @Override
    public long count(String keyword) {
        LambdaQueryWrapper<ReportData> wrapper = new LambdaQueryWrapper<ReportData>()
                .eq(ReportData::getDeleted, 0);

        if (StringUtils.hasText(keyword)) {
            wrapper.like(ReportData::getReportName, keyword);
        }

        return reportDataMapper.selectCount(wrapper);
    }

    @Override
    public void save(ReportData report) {
        reportDataMapper.insert(report);
    }

    @Override
    public void update(ReportData report) {
        reportDataMapper.updateById(report);
    }

    @Override
    public void delete(String id) {
        reportDataMapper.update(null,
                new LambdaUpdateWrapper<ReportData>()
                        .eq(ReportData::getId, id)
                        .set(ReportData::getDeleted, 1)
        );
    }
}



