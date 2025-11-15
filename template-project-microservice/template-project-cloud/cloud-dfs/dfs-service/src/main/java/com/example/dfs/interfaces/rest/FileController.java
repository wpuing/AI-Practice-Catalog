package com.example.dfs.interfaces.rest;

import com.example.core.common.result.Result;
import com.example.dfs.application.dto.FileDTO;
import com.example.dfs.application.dto.PageResult;
import com.example.dfs.application.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

/**
 * 文件控制器
 */
@RestController
@RequestMapping("/api/dfs")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @GetMapping
    public Result<PageResult<FileDTO>> getFileList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        PageResult<FileDTO> result = fileService.getFileList(pageNum, pageSize, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<FileDTO> getFileById(@PathVariable String id) {
        FileDTO file = fileService.getFileById(id);
        return Result.success(file);
    }

    @PostMapping("/upload")
    public Result<FileDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) String userId) throws IOException {
        FileDTO fileDTO = fileService.uploadFile(file, userId);
        return Result.success(fileDTO);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteFile(@PathVariable String id) {
        fileService.deleteFile(id);
        return Result.success();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) throws IOException {
        Path filePath = fileService.getFilePath(id);
        Resource resource = new FileSystemResource(filePath);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewFile(@PathVariable String id) throws IOException {
        Path filePath = fileService.getFilePath(id);
        Resource resource = new FileSystemResource(filePath);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}



