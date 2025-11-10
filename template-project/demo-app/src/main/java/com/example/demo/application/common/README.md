# 后端代码逻辑说明

## 基础架构

### 1. BaseEntity（基础实体类）

所有实体类都继承自 `BaseEntity`，包含以下公共字段：

- `id`: 主键ID（32位随机字符）
- `createDate`: 创建时间
- `createUser`: 创建用户ID
- `updateDate`: 修改时间
- `updateUser`: 修改用户ID
- `deleted`: 是否删除（0=未删除，1=已删除）
- `dbVersion`: 版本号（乐观锁）
- `tenantId`: 租户ID

### 2. MetaObjectHandler（自动填充处理器）

自动填充基础字段：

**插入时自动填充：**
- `createDate` / `createTime`: 当前时间
- `createUser`: 当前登录用户ID
- `deleted`: 0（未删除）
- `dbVersion`: 1（初始版本）
- `updateDate` / `updateTime`: 当前时间

**更新时自动填充：**
- `updateDate` / `updateTime`: 当前时间
- `updateUser`: 当前登录用户ID

### 3. BaseServiceImpl（Service基类）

提供以下功能：

- **自动生成ID**: 保存时如果ID为空，自动使用 `IdGenerator.generateId()` 生成32位随机ID
- **逻辑删除**: 提供 `logicDeleteById()` 和 `logicDeleteBatchByIds()` 方法
- **查询过滤**: 默认过滤已删除的数据（`deleted = 0`）
- **构建查询条件**: 提供 `buildQueryWrapper()` 和 `buildQueryWrapperWithDeleted()` 方法

### 4. IdGenerator（ID生成工具）

生成32位随机字符ID（小写字母和数字）：

```java
String id = IdGenerator.generateId(); // 生成32位ID
String id = IdGenerator.generateId(16); // 生成指定长度的ID
```

## 使用示例

### Service层继承BaseServiceImpl

```java
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User> implements UserService {
    // 自动获得ID生成、逻辑删除等功能
}
```

### Controller层使用

```java
@PostMapping
public Result<User> createUser(@RequestBody User user) {
    // ID会自动生成，基础字段会自动填充
    userService.save(user);
    return Result.success(user);
}

@DeleteMapping("/{id}")
public Result<String> deleteUser(@PathVariable String id) {
    // 逻辑删除
    userService.logicDeleteById(id);
    return Result.success("删除成功");
}
```

### 查询时过滤已删除数据

```java
// 方式1：使用buildQueryWrapper()（推荐）
QueryWrapper<User> wrapper = buildQueryWrapper();
wrapper.eq("username", "admin");
List<User> users = userService.list(wrapper);

// 方式2：手动添加条件
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("username", "admin");
wrapper.eq("deleted", 0);
List<User> users = userService.list(wrapper);

// 方式3：查询包含已删除的数据
QueryWrapper<User> wrapper = buildQueryWrapperWithDeleted();
wrapper.eq("username", "admin");
List<User> users = userService.list(wrapper);
```

## 注意事项

1. **ID生成**: 所有实体保存前会自动生成32位随机ID，无需手动设置
2. **基础字段**: 插入和更新时基础字段会自动填充，无需手动设置
3. **逻辑删除**: 删除操作使用逻辑删除，不会物理删除数据
4. **查询过滤**: 默认查询会自动过滤已删除的数据，如需查询已删除数据，使用 `buildQueryWrapperWithDeleted()`
5. **乐观锁**: 更新数据时注意处理 `dbVersion` 字段，防止并发更新冲突

