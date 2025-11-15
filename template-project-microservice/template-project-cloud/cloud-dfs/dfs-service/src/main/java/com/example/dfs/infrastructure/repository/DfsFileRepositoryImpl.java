package com.example.dfs.infrastructure.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.dfs.domain.entity.DfsFile;
import com.example.dfs.domain.repository.DfsFileRepository;
import com.example.dfs.infrastructure.repository.mapper.DfsFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 文件信息仓储实现
 */
@Repository
@RequiredArgsConstructor
public class DfsFileRepositoryImpl implements DfsFileRepository {
    private final DfsFileMapper dfsFileMapper;

    @Override
    public DfsFile findById(String id) {
        return dfsFileMapper.selectOne(
                new LambdaQueryWrapper<DfsFile>()
                        .eq(DfsFile::getId, id)
                        .eq(DfsFile::getDeleted, 0)
        );
    }

    @Override
    public List<DfsFile> findList(int pageNum, int pageSize, String keyword) {
        LambdaQueryWrapper<DfsFile> wrapper = new LambdaQueryWrapper<DfsFile>()
                .eq(DfsFile::getDeleted, 0)
                .orderByDesc(DfsFile::getUploadTime);

        if (StringUtils.hasText(keyword)) {
            wrapper.like(DfsFile::getFileName, keyword);
        }

        Page<DfsFile> page = new Page<>(pageNum, pageSize);
        Page<DfsFile> result = dfsFileMapper.selectPage(page, wrapper);
        return result.getRecords();
    }

    @Override
    public long count(String keyword) {
        LambdaQueryWrapper<DfsFile> wrapper = new LambdaQueryWrapper<DfsFile>()
                .eq(DfsFile::getDeleted, 0);

        if (StringUtils.hasText(keyword)) {
            wrapper.like(DfsFile::getFileName, keyword);
        }

        return dfsFileMapper.selectCount(wrapper);
    }

    @Override
    public void save(DfsFile file) {
        dfsFileMapper.insert(file);
    }

    @Override
    public void update(DfsFile file) {
        dfsFileMapper.updateById(file);
    }

    @Override
    public void delete(String id) {
        dfsFileMapper.update(null,
                new LambdaUpdateWrapper<DfsFile>()
                        .eq(DfsFile::getId, id)
                        .set(DfsFile::getDeleted, 1)
        );
    }
}



