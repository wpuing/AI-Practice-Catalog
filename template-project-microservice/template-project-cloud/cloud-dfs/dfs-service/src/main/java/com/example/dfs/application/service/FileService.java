package com.example.dfs.application.service;

import com.example.core.common.exception.BusinessException;
import com.example.core.common.result.Result;
import com.example.core.common.result.ResultCode;
import com.example.core.feign.UserFeignClient;
import com.example.dfs.application.dto.FileDTO;
import com.example.dfs.application.dto.PageResult;
import com.example.dfs.domain.entity.DfsFile;
import com.example.dfs.domain.repository.DfsFileRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 文件服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {
    private final DfsFileRepository dfsFileRepository;
    private final UserFeignClient userFeignClient;

    @Value("${file.upload.path:/data/uploads}")
    private String uploadPath;

    public PageResult<FileDTO> getFileList(int pageNum, int pageSize, String keyword) {
        List<DfsFile> files = dfsFileRepository.findList(pageNum, pageSize, keyword);
        long total = dfsFileRepository.count(keyword);

        // 批量查询用户名映射
        Map<String, String> userIdToUsernameMap = loadUserNames(files);

        List<FileDTO> fileDTOs = files.stream()
                .map(file -> convertToDTO(file, userIdToUsernameMap))
                .collect(Collectors.toList());

        return new PageResult<>(fileDTOs, total, pageNum, pageSize);
    }

    /**
     * 批量加载用户名映射
     */
    private Map<String, String> loadUserNames(List<DfsFile> files) {
        Map<String, String> userIdToUsernameMap = new HashMap<>();
        
        // 收集所有唯一的用户ID
        List<String> userIds = files.stream()
                .map(DfsFile::getUploadUserId)
                .filter(userId -> userId != null && !userId.isEmpty() && !"system".equals(userId))
                .distinct()
                .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            return userIdToUsernameMap;
        }

        // 批量查询用户名
        for (String userId : userIds) {
            try {
                Result<Map<String, Object>> result = userFeignClient.getUserById(userId);
                if (result != null && result.getData() != null) {
                    Map<String, Object> userData = result.getData();
                    String username = (String) userData.get("username");
                    if (username != null && !username.isEmpty()) {
                        userIdToUsernameMap.put(userId, username);
                    } else {
                        userIdToUsernameMap.put(userId, userId); // 如果查询不到用户名，使用ID
                    }
                } else {
                    userIdToUsernameMap.put(userId, userId);
                }
            } catch (FeignException.NotFound e) {
                // 用户不存在，使用ID作为显示值
                log.debug("User not found for id: {}", userId);
                userIdToUsernameMap.put(userId, userId);
            } catch (FeignException e) {
                // Feign调用失败（包括500错误等），记录警告但不影响其他用户查询
                log.warn("Failed to load username for user id: {} - Status: {}, Message: {}", 
                    userId, e.status(), e.getMessage());
                userIdToUsernameMap.put(userId, userId); // 查询失败时使用ID
            } catch (Exception e) {
                // 其他异常，记录警告但不影响其他用户查询
                log.warn("Unexpected error loading username for user id: {}", userId, e);
                userIdToUsernameMap.put(userId, userId); // 查询失败时使用ID
            }
        }

        return userIdToUsernameMap;
    }

    public FileDTO getFileById(String id) {
        DfsFile file = dfsFileRepository.findById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件不存在");
        }
        // 查询单个文件时也加载用户名，即使失败也不影响文件信息返回
        Map<String, String> userIdToUsernameMap = new HashMap<>();
        try {
            userIdToUsernameMap = loadUserNames(List.of(file));
        } catch (Exception e) {
            log.warn("Failed to load username for file: {}", id, e);
            // 即使加载用户名失败，也返回文件信息
        }
        return convertToDTO(file, userIdToUsernameMap);
    }

    @Transactional
    public FileDTO uploadFile(MultipartFile file, String userId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExt = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
        String fileName = UUID.randomUUID().toString().replace("-", "") + fileExt;
        
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());

        DfsFile dfsFile = new DfsFile();
        dfsFile.setFileName(originalFilename);
        dfsFile.setFilePath(filePath.toString());
        dfsFile.setFileSize(file.getSize());
        dfsFile.setFileType(file.getContentType());
        dfsFile.setFileExt(fileExt);
        dfsFile.setUploadUserId(userId);
        dfsFile.setUploadTime(LocalDateTime.now());
        dfsFile.setCreateDate(LocalDateTime.now());
        dfsFile.setCreateUser(userId != null ? userId : "system");
        dfsFile.setDeleted(0);
        dfsFile.setDbVersion(1);

        dfsFileRepository.save(dfsFile);
        
        // 保存后再设置 accessUrl，因为需要文件ID
        dfsFile.setAccessUrl("/api/dfs/" + dfsFile.getId() + "/download");
        dfsFileRepository.save(dfsFile);
        
        // 上传文件时，如果userId不为空，查询用户名
        Map<String, String> userIdToUsernameMap = new HashMap<>();
        if (userId != null && !userId.isEmpty() && !"system".equals(userId)) {
            try {
                Result<Map<String, Object>> result = userFeignClient.getUserById(userId);
                if (result != null && result.getData() != null) {
                    Map<String, Object> userData = result.getData();
                    String username = (String) userData.get("username");
                    if (username != null && !username.isEmpty()) {
                        userIdToUsernameMap.put(userId, username);
                    }
                }
            } catch (FeignException.NotFound e) {
                // 用户不存在，忽略
                log.debug("User not found for id: {}", userId);
            } catch (FeignException e) {
                // Feign调用失败，记录警告但不影响文件上传
                log.warn("Failed to load username for user id: {} - Status: {}", userId, e.status());
            } catch (Exception e) {
                // 其他异常，记录警告但不影响文件上传
                log.warn("Unexpected error loading username for user id: {}", userId, e);
            }
        }
        return convertToDTO(dfsFile, userIdToUsernameMap);
    }

    @Transactional
    public void deleteFile(String id) {
        DfsFile file = dfsFileRepository.findById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件不存在");
        }
        dfsFileRepository.delete(id);
    }

    public java.nio.file.Path getFilePath(String id) {
        DfsFile file = dfsFileRepository.findById(id);
        if (file == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件不存在");
        }
        return Paths.get(file.getFilePath());
    }

    private FileDTO convertToDTO(DfsFile file) {
        return convertToDTO(file, new HashMap<>());
    }

    private FileDTO convertToDTO(DfsFile file, Map<String, String> userIdToUsernameMap) {
        FileDTO dto = new FileDTO();
        dto.setId(file.getId());
        dto.setFileName(file.getFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setUploadUserId(file.getUploadUserId());
        
        // 设置用户名：优先使用映射中的用户名，如果没有则使用用户ID，如果是system则显示"系统"
        String uploadUserId = file.getUploadUserId();
        if (uploadUserId == null || uploadUserId.isEmpty() || "system".equals(uploadUserId)) {
            dto.setUploadUser("系统");
        } else {
            String username = userIdToUsernameMap.get(uploadUserId);
            dto.setUploadUser(username != null ? username : uploadUserId);
        }
        
        dto.setUploadDate(file.getUploadTime());
        dto.setUploadTime(file.getUploadTime());
        dto.setAccessUrl(file.getAccessUrl());
        return dto;
    }
}



