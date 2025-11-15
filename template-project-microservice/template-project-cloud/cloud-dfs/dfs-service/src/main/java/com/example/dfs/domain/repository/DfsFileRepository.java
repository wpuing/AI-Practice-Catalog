package com.example.dfs.domain.repository;

import com.example.dfs.domain.entity.DfsFile;

import java.util.List;

/**
 * 文件信息仓储接口
 */
public interface DfsFileRepository {
    DfsFile findById(String id);
    List<DfsFile> findList(int pageNum, int pageSize, String keyword);
    long count(String keyword);
    void save(DfsFile file);
    void update(DfsFile file);
    void delete(String id);
}



