package com.example.demo.domain.log.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.domain.log.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 操作日志Mapper
 */
@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {

    /**
     * 删除指定时间之前的日志
     */
    int deleteByCreateTimeBefore(@Param("createTime") LocalDateTime createTime);

    /**
     * 查询指定时间之前的日志（用于文件持久化）
     */
    List<OperationLog> selectByCreateTimeBefore(@Param("createTime") LocalDateTime createTime);
}

