# 架构文档索引

本目录包含项目的架构设计文档。

## 📐 架构文档

### ARCHITECTURE.md - 项目架构说明
详细说明项目的分层架构设计，包括：

- **分层架构**: common, infrastructure, domain, application, interfaces
- **模块划分**: 业务模块与基础设施模块的隔离
- **依赖关系**: 各层之间的依赖规则
- **设计原则**: DDD设计原则和最佳实践
- **模块职责**: 每个模块的具体职责说明

## 🏗️ 架构层次

```
com.example.demo/
├── common/              # 公共模块（跨层共享）
├── infrastructure/      # 基础设施层（技术实现）
├── domain/             # 领域层（业务领域模型）
├── application/        # 应用层（业务逻辑编排）
└── interfaces/         # 接口层（对外API）
```

## 📚 相关文档

- **项目文档**: `../README.md`
- **API文档**: `../api/API.md`
- **重构文档**: `../refactoring/`

## 🎯 设计目标

- ✅ 清晰的层次划分
- ✅ 业务与基础设施隔离
- ✅ 依赖关系清晰
- ✅ 易于维护和扩展

