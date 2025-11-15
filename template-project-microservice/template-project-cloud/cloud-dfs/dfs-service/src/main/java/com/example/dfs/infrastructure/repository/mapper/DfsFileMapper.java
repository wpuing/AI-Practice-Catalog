package com.example.dfs.infrastructure.repository.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.dfs.domain.entity.DfsFile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文件信息 Mapper
 */
@Mapper
public interface DfsFileMapper extends BaseMapper<DfsFile> {
}



