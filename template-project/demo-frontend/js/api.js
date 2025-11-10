/**
 * API请求工具类
 * 封装fetch请求，统一处理Token和错误
 */

const API_BASE_URL = 'http://localhost:8081/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token') || '';
        this.username = localStorage.getItem('username') || '';
        this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
        this.menus = JSON.parse(localStorage.getItem('menus') || '[]');
    }

    /**
     * 更新Token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    /**
     * 更新用户信息
     */
    setUserInfo(username, roles, menus) {
        this.username = username;
        this.roles = Array.isArray(roles) ? roles : [];
        this.menus = Array.isArray(menus) ? menus : [];
        localStorage.setItem('username', username);
        localStorage.setItem('roles', JSON.stringify(this.roles));
        localStorage.setItem('menus', JSON.stringify(this.menus));
    }

    /**
     * 清除用户信息
     */
    clearUserInfo() {
        this.token = '';
        this.username = '';
        this.roles = [];
        this.menus = [];
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        localStorage.removeItem('menus');
    }

    /**
     * 检查是否已登录
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * 检查是否有管理员权限
     */
    isAdmin() {
        return this.roles.includes('ADMIN') || this.isSuperAdmin();
    }

    /**
     * 检查是否有超级管理员权限
     */
    isSuperAdmin() {
        return this.roles.includes('SUPER_ADMIN');
    }

    /**
     * 检查是否有菜单权限
     */
    hasMenuPermission(menuCode) {
        if (this.isSuperAdmin()) {
            return true; // 超级管理员拥有所有菜单权限
        }
        return this.menus.some(menu => menu.menuCode === menuCode && menu.enabled);
    }

    /**
     * 通用请求方法
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // 添加Token
        if (this.token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // 处理CORS预检请求错误
            if (!response.ok && response.status === 0) {
                throw new Error('CORS错误：无法连接到服务器，请检查后端服务是否运行');
            }

            // 处理空响应（某些DELETE请求可能返回空）
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // 如果不是JSON响应，尝试读取文本
                const text = await response.text();
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        data = { code: response.ok ? 200 : response.status, message: text || '请求成功', data: null };
                    }
                } else {
                    data = { code: response.ok ? 200 : response.status, message: '请求成功', data: null };
                }
            }

            // Token失效，跳转登录
            if (data.code === 401 || response.status === 401) {
                this.clearUserInfo();
                if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                    window.location.href = 'index.html';
                }
                throw new Error(data.message || 'Token已失效，请重新登录');
            }

            // 处理403权限错误
            if (data.code === 403 || response.status === 403) {
                throw new Error(data.message || '无权限访问，请检查您的角色权限');
            }

            // 兼容两种响应格式：Result<T>格式（有code字段）和Map格式（有success字段）
            if (data.success !== undefined) {
                // 如果是Map格式，转换为Result格式
                if (data.success) {
                    data.code = 200;
                } else {
                    // 根据HTTP状态码设置错误码
                    if (response.status >= 400) {
                        data.code = response.status;
                    } else {
                        data.code = 400;
                    }
                }
                // 确保有message字段
                if (!data.message) {
                    data.message = data.success ? '操作成功' : '操作失败';
                }
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            // 如果是网络错误，提供更友好的提示
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('网络连接失败，请检查：\n1. 后端服务是否运行在 http://localhost:8081\n2. 是否有CORS跨域问题');
            }
            throw error;
        }
    }

    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST请求
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT请求
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE请求
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ========== 认证接口 ==========

    /**
     * 用户登录
     */
    async login(username, password) {
        const response = await this.post('/auth/login', { username, password });
        if (response.code === 200 && response.data.token) {
            this.setToken(response.data.token);
            this.setUserInfo(
                response.data.username, 
                response.data.roles || [],
                response.data.menus || []
            );
            return response.data;
        }
        throw new Error(response.message || '登录失败');
    }

    /**
     * 用户注册
     */
    async register(username, password) {
        return this.post('/auth/register', { username, password });
    }

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        const response = await this.get('/auth/me');
        if (response.code === 200 && response.data) {
            // 更新本地存储的角色和菜单信息
            if (response.data.roles) {
                this.roles = response.data.roles;
                localStorage.setItem('roles', JSON.stringify(this.roles));
            }
            if (response.data.menus) {
                this.menus = response.data.menus;
                localStorage.setItem('menus', JSON.stringify(this.menus));
            }
        }
        return response;
    }

    /**
     * 刷新Token
     */
    async refreshToken() {
        const response = await this.post('/auth/refresh');
        // 如果刷新成功，更新token（虽然token值不变，但刷新时间会更新）
        if (response.code === 200 && response.data && response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    /**
     * 退出登录
     */
    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.clearUserInfo();
        }
    }

    // ========== 用户管理接口 ==========

    /**
     * 获取用户列表（分页）
     */
    async getUsers(current = 1, size = 10, keyword = null) {
        const params = { current, size };
        if (keyword) params.keyword = keyword;
        return this.get('/users', params);
    }

    /**
     * 获取控制台统计数据（真实数据库统计）
     */
    async getStatistics() {
        return this.get('/admin/statistics');
    }

    /**
     * 根据ID查询用户
     */
    async getUserById(id) {
        return this.get(`/users/${id}`);
    }

    /**
     * 创建用户
     */
    async createUser(userData) {
        return this.post('/users', userData);
    }

    /**
     * 更新用户
     */
    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    /**
     * 删除用户
     */
    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    /**
     * 搜索用户
     */
    async searchUsers(username) {
        return this.get('/users/search', { username });
    }

    // ========== 商品类型管理接口 ==========

    /**
     * 获取商品类型列表（分页）
     */
    async getProductTypes(current = 1, size = 10, enabled = null, keyword = null) {
        const params = { current, size };
        if (enabled !== null) params.enabled = enabled;
        if (keyword) params.keyword = keyword;
        return this.get('/product-types', params);
    }

    /**
     * 获取所有启用的商品类型
     */
    async getEnabledProductTypes() {
        return this.get('/product-types/enabled');
    }

    /**
     * 根据ID查询商品类型
     */
    async getProductTypeById(id) {
        return this.get(`/product-types/${id}`);
    }

    /**
     * 创建商品类型
     */
    async createProductType(typeData) {
        return this.post('/product-types', typeData);
    }

    /**
     * 更新商品类型
     */
    async updateProductType(id, typeData) {
        return this.put(`/product-types/${id}`, typeData);
    }

    /**
     * 删除商品类型
     */
    async deleteProductType(id) {
        return this.delete(`/product-types/${id}`);
    }

    /**
     * 搜索商品类型
     */
    async searchProductTypes(keyword) {
        return this.get('/product-types/search', { keyword });
    }

    // ========== 商品管理接口 ==========

    /**
     * 获取商品列表（分页）
     */
    async getProducts(current = 1, size = 10, typeId = null, enabled = null, keyword = null) {
        const params = { current, size };
        if (typeId) params.typeId = typeId;
        if (enabled !== null) params.enabled = enabled;
        if (keyword) params.keyword = keyword;
        return this.get('/products', params);
    }

    /**
     * 获取所有启用的商品
     */
    async getEnabledProducts(typeId = null) {
        const params = typeId ? { typeId } : {};
        return this.get('/products/enabled', params);
    }

    /**
     * 根据ID查询商品
     */
    async getProductById(id) {
        return this.get(`/products/${id}`);
    }

    /**
     * 创建商品
     */
    async createProduct(productData) {
        return this.post('/products', productData);
    }

    /**
     * 更新商品
     */
    async updateProduct(id, productData) {
        return this.put(`/products/${id}`, productData);
    }

    /**
     * 删除商品
     */
    async deleteProduct(id) {
        return this.delete(`/products/${id}`);
    }

    /**
     * 搜索商品
     */
    async searchProducts(keyword, typeId = null) {
        const params = { keyword };
        if (typeId) params.typeId = typeId;
        return this.get('/products/search', params);
    }

    /**
     * 更新商品库存
     * 注意：实际接口可能需要在更新商品时一起更新库存
     */
    async updateProductStock(id, stock) {
        // 先获取商品信息，然后更新库存
        const product = await this.getProductById(id);
        if (product.code === 200) {
            const productData = product.data;
            productData.stock = stock;
            return this.updateProduct(id, productData);
        }
        throw new Error('获取商品信息失败');
    }

    // ========== 管理员接口 ==========

    /**
     * 获取管理员信息
     */
    async getAdminInfo() {
        return this.get('/admin/info');
    }

    /**
     * 获取所有用户（管理员）
     */
    async getAllUsers() {
        return this.get('/admin/users/all');
    }

    /**
     * 强制删除用户（管理员）
     */
    async forceDeleteUser(id) {
        return this.delete(`/admin/users/${id}`);
    }

    // ========== 角色管理接口 ==========

    /**
     * 获取所有角色
     */
    async getRoles(keyword = null) {
        const params = {};
        if (keyword) params.keyword = keyword;
        return this.get('/admin/roles', params);
    }

    /**
     * 根据ID获取角色
     */
    async getRoleById(id) {
        return this.get(`/admin/roles/${id}`);
    }

    /**
     * 创建角色
     */
    async createRole(roleData) {
        return this.post('/admin/roles', roleData);
    }

    /**
     * 更新角色
     */
    async updateRole(id, roleData) {
        return this.put(`/admin/roles/${id}`, roleData);
    }

    /**
     * 删除角色
     */
    async deleteRole(id) {
        return this.delete(`/admin/roles/${id}`);
    }

    /**
     * 为用户分配角色（批量）
     */
    async assignRoles(userId, roleIds) {
        return this.post('/admin/roles/assign', { userId, roleIds });
    }

    /**
     * 获取用户的角色列表（角色代码）
     */
    async getUserRoles(userId) {
        return this.get(`/admin/roles/user/${userId}`);
    }

    /**
     * 获取用户的角色列表（完整角色对象）
     */
    async getUserRoleDetails(userId) {
        return this.get(`/admin/roles/user/${userId}/details`);
    }

    /**
     * 移除用户的角色
     */
    async removeUserRole(userId, roleId) {
        return this.delete(`/admin/roles/user/${userId}/role/${roleId}`);
    }

    // ========== 安全配置接口 ==========

    /**
     * 获取所有白名单
     */
    async getWhitelist() {
        return this.get('/security/config/whitelist');
    }

    /**
     * 添加白名单
     */
    async createWhitelist(whitelistData) {
        return this.post('/security/config/whitelist', whitelistData);
    }

    /**
     * 更新白名单
     */
    async updateWhitelist(id, whitelistData) {
        return this.put(`/security/config/whitelist/${id}`, whitelistData);
    }

    /**
     * 删除白名单
     */
    async deleteWhitelist(id) {
        return this.delete(`/security/config/whitelist/${id}`);
    }

    /**
     * 刷新安全配置缓存
     */
    async refreshWhitelist() {
        return this.post('/security/config/refresh');
    }

    /**
     * 获取所有权限（分页）
     */
    async getPermissions(current = 1, size = 15, keyword = '') {
        const params = { current, size };
        if (keyword) params.keyword = keyword;
        return this.get('/security/config/permission', params);
    }

    /**
     * 获取所有权限（不分页，用于下拉选择等场景）
     */
    async getAllPermissionsList() {
        return this.get('/security/config/permission/all');
    }

    /**
     * 添加权限
     */
    async createPermission(permissionData) {
        return this.post('/security/config/permission', permissionData);
    }

    /**
     * 更新权限
     */
    async updatePermission(id, permissionData) {
        return this.put(`/security/config/permission/${id}`, permissionData);
    }

    /**
     * 删除权限
     */
    async deletePermission(id) {
        return this.delete(`/security/config/permission/${id}`);
    }

    /**
     * 刷新安全配置缓存
     */
    async refreshPermissions() {
        return this.post('/security/config/refresh');
    }

    // ========== Redis管理接口 ==========

    /**
     * 获取Redis信息
     */
    async getRedisInfo() {
        return this.get('/redis/info');
    }

    /**
     * 获取在线用户列表（分页）
     */
    async getOnlineUsers(current = 1, size = 15, keyword = null) {
        const params = { current, size };
        if (keyword) params.keyword = keyword;
        return this.get('/redis/online-users', params);
    }

    /**
     * 踢用户下线
     */
    async kickUserOffline(token) {
        return this.post('/redis/online-users/kick', { token });
    }

    /**
     * 查询Redis Keys
     */
    async getRedisKeys(pattern = '*') {
        return this.get('/redis/keys', { pattern });
    }

    /**
     * 获取Redis Key值
     */
    async getRedisValue(key) {
        return this.get('/redis/get', { key });
    }

    /**
     * 设置Redis Key值
     */
    async setRedisValue(key, value) {
        return this.post('/redis/set', { key, value });
    }

    /**
     * 删除Redis Key
     */
    async deleteRedisKey(key) {
        return this.delete(`/redis/delete?key=${key}`);
    }

    /**
     * 获取Token信息
     */
    async getRedisTokens() {
        return this.get('/redis/tokens');
    }

    // ========== 菜单管理接口 ==========

    /**
     * 获取所有菜单（分页）
     */
    async getMenus(current = 1, size = 15, keyword = '') {
        const params = { current, size };
        if (keyword) params.keyword = keyword;
        return this.get('/admin/menus', params);
    }

    /**
     * 获取所有菜单（不分页，用于下拉选择等场景）
     */
    async getAllMenusList() {
        return this.get('/admin/menus/all');
    }

    /**
     * 获取所有启用的菜单
     */
    async getEnabledMenus() {
        return this.get('/admin/menus/enabled');
    }

    /**
     * 根据角色ID获取菜单列表
     */
    async getMenusByRoleId(roleId) {
        return this.get(`/admin/menus/role/${roleId}`);
    }

    /**
     * 根据ID获取菜单
     */
    async getMenuById(id) {
        return this.get(`/admin/menus/${id}`);
    }

    /**
     * 创建菜单
     */
    async createMenu(menuData) {
        return this.post('/admin/menus', menuData);
    }

    /**
     * 更新菜单
     */
    async updateMenu(id, menuData) {
        return this.put(`/admin/menus/${id}`, menuData);
    }

    /**
     * 删除菜单
     */
    async deleteMenu(id) {
        return this.delete(`/admin/menus/${id}`);
    }

    /**
     * 为角色分配菜单
     */
    async assignMenusToRole(roleId, menuIds) {
        return this.post('/admin/menus/assign', { roleId, menuIds });
    }

    /**
     * 获取角色的菜单ID列表
     */
    async getMenuIdsByRoleId(roleId) {
        return this.get(`/admin/menus/role/${roleId}/menu-ids`);
    }

    /**
     * 根据菜单ID获取功能权限列表
     */
    async getMenuPermissions(menuId) {
        return this.get(`/admin/menus/${menuId}/permissions`);
    }

    /**
     * 根据菜单ID获取安全权限ID列表
     */
    async getMenuPermissionIds(menuId) {
        return this.get(`/admin/menus/${menuId}/permission-ids`);
    }

    /**
     * 为菜单分配安全权限（通过 security_permission ID）
     */
    async assignPermissionsToMenu(menuId, securityPermissionIds) {
        return this.post(`/admin/menus/${menuId}/permissions`, { securityPermissionIds });
    }

    // ========== 操作日志接口 ==========

    /**
     * 分页查询日志
     */
    async getLogs(page = 1, size = 10, module = null, operationType = null, username = null) {
        const params = { page, size };
        if (module) params.module = module;
        if (operationType) params.operationType = operationType;
        if (username) params.username = username;
        return this.get('/admin/logs', params);
    }

    /**
     * 根据ID查询日志详情
     */
    async getLogById(logId) {
        return this.get(`/admin/logs/${logId}`);
    }

    /**
     * 导出日志
     */
    async exportLogs(module = null, operationType = null, username = null) {
        const params = {};
        if (module) params.module = module;
        if (operationType) params.operationType = operationType;
        if (username) params.username = username;
        
        const queryString = new URLSearchParams(params).toString();
        const url = `/admin/logs/export${queryString ? '?' + queryString : ''}`;
        
        try {
            const response = await fetch(API_BASE_URL + url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('导出失败');
            }

            // 获取文件名
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'operation_logs.txt';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // 下载文件
            const blob = await response.blob();
            const url_blob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url_blob;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url_blob);

            return { code: 200, message: '导出成功' };
        } catch (error) {
            console.error('导出日志失败:', error);
            throw error;
        }
    }

    // ========== 公共接口 ==========

    /**
     * 获取公共信息
     */
    async getPublicInfo() {
        return this.get('/public/info');
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        return this.get('/public/health');
    }
}

// 创建全局API客户端实例
const api = new ApiClient();

