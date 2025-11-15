package com.example.report.infrastructure.repository.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.report.domain.entity.ReportData;
import org.apache.ibatis.annotations.Mapper;

/**
 * 报表数据 Mapper
 */
@Mapper
public interface ReportDataMapper extends BaseMapper<ReportData> {
}



