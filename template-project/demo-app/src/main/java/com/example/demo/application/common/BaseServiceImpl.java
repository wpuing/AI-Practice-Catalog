package com.example.demo.application.common;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.common.util.IdGenerator;
import com.example.demo.domain.common.BaseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

/**
 * Service基类
 * 提供逻辑删除和查询过滤功能
 */
public abstract class BaseServiceImpl<M extends BaseMapper<T>, T extends BaseEntity> 
        extends ServiceImpl<M, T> {

    /**
     * 保存实体（自动生成ID）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(T entity) {
        if (entity.getId() == null || entity.getId().isEmpty()) {
            entity.setId(IdGenerator.generateId());
        }
        // deleted字段由MetaObjectHandler自动填充为0
        return super.save(entity);
    }

    /**
     * 批量保存（自动生成ID）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveBatch(Collection<T> entityList) {
        entityList.forEach(entity -> {
            if (entity.getId() == null || entity.getId().isEmpty()) {
                entity.setId(IdGenerator.generateId());
            }
        });
        return super.saveBatch(entityList);
    }

    /**
     * 逻辑删除（设置deleted=1）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean logicDeleteById(String id) {
        T entity = getById(id);
        if (entity != null) {
            entity.setDeleted(1);
            return updateById(entity);
        }
        return false;
    }

    /**
     * 批量逻辑删除
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean logicDeleteBatchByIds(Collection<String> ids) {
        Collection<T> entities = listByIds(ids);
        entities.forEach(entity -> entity.setDeleted(1));
        return updateBatchById(entities);
    }

    /**
     * 构建查询条件（默认过滤已删除的数据）
     */
    protected QueryWrapper<T> buildQueryWrapper() {
        QueryWrapper<T> wrapper = new QueryWrapper<>();
        wrapper.eq("deleted", 0);
        return wrapper;
    }

    /**
     * 构建查询条件（包含已删除的数据）
     */
    protected QueryWrapper<T> buildQueryWrapperWithDeleted() {
        return new QueryWrapper<>();
    }

    /**
     * 重写list方法，默认过滤已删除的数据
     * 注意：如果QueryWrapper中已经设置了deleted条件，则不会自动添加
     * 建议使用buildQueryWrapper()方法来构建查询条件
     */
    @Override
    public java.util.List<T> list(Wrapper<T> queryWrapper) {
        if (queryWrapper instanceof QueryWrapper) {
            QueryWrapper<T> qw = (QueryWrapper<T>) queryWrapper;
            // 简单检查：如果SQL中不包含deleted，则添加过滤条件
            String sqlSegment = qw.getTargetSql();
            if (sqlSegment == null || !sqlSegment.toLowerCase().contains("deleted")) {
                qw.eq("deleted", 0);
            }
        }
        return super.list(queryWrapper);
    }

    /**
     * 重写count方法，默认过滤已删除的数据
     * 注意：如果QueryWrapper中已经设置了deleted条件，则不会自动添加
     * 建议使用buildQueryWrapper()方法来构建查询条件
     */
    @Override
    public long count(Wrapper<T> queryWrapper) {
        if (queryWrapper instanceof QueryWrapper) {
            QueryWrapper<T> qw = (QueryWrapper<T>) queryWrapper;
            // 简单检查：如果SQL中不包含deleted，则添加过滤条件
            String sqlSegment = qw.getTargetSql();
            if (sqlSegment == null || !sqlSegment.toLowerCase().contains("deleted")) {
                qw.eq("deleted", 0);
            }
        }
        return super.count(queryWrapper);
    }
}

