# 商业计划书导出格式功能说明

## 更新内容

现在商业计划书生成功能支持多种格式导出,包括:

### 1. **TXT 格式** (纯文本)
- 移除所有 Markdown 格式标记
- 保留内容结构和换行
- 适合在任何文本编辑器中查看
- 文件大小最小

### 2. **Markdown 格式** (已有)
- 保留完整的 Markdown 格式
- 支持标题、列表、引用等格式
- 适合在支持 Markdown 的编辑器中查看
- 可以轻松转换为其他格式

### 3. **PDF 格式** (新增)
- 专业的PDF文档输出
- 自动分页处理
- 适合打印和正式分享
- 需要登录才能下载

## 如何使用

### 前端使用 (business-plan/page.tsx)

在商业计划书详情页,点击下载按钮可以选择不同格式:

```tsx
// 下载TXT格式
<Button onClick={() => handleDownload('txt')}>
  下载 TXT
</Button>

// 下载Markdown格式
<Button onClick={() => handleDownload('markdown')}>
  下载 Markdown
</Button>

// 下载PDF格式 (需要登录)
<Button onClick={() => handleDownload('pdf')}>
  下载 PDF
</Button>
```

### API 使用

```bash
# 下载TXT格式
GET /api/documents/download?sessionId=xxx&format=txt&type=guide

# 下载Markdown格式
GET /api/documents/download?sessionId=xxx&format=markdown&type=guide

# 下载PDF格式 (需要Bearer token)
GET /api/documents/download?sessionId=xxx&format=pdf&type=guide
Authorization: Bearer <token>
```

## 技术实现

### TXT 格式
- 前端直接生成,使用正则表达式移除 Markdown 语法
- 无需服务器处理,即时下载
- MIME 类型: `text/plain`

### Markdown 格式
- 使用 `generateGuideMarkdown()` 函数生成
- 前端直接下载,无需服务器
- MIME 类型: `text/markdown`

### PDF 格式
- 后端使用 `@react-pdf/renderer` 库生成
- 通过 `generateGuidePDF()` 函数转换内容为 PDF
- 自动分页,每页约50行
- MIME 类型: `application/pdf`

## 文件位置

- **前端页面**: `src/app/business-plan/page.tsx`
- **UI组件**: `src/components/business-plan/LandingCoachDisplay.tsx`
- **PDF生成器**: `src/lib/utils/pdfGenerator.ts`
- **API路由**: `src/app/api/documents/download/route.ts`
- **Markdown生成**: `src/lib/utils/transformReportToGuide.ts`

## 注意事项

1. **PDF下载需要登录**: 为了保护内容,PDF格式需要用户登录后才能下载
2. **TXT和Markdown无需登录**: 这两种格式可以匿名下载
3. **文件命名**: 所有格式的文件名都包含创意标题,便于识别
4. **错误处理**: 如果PDF生成失败,会提示用户选择其他格式

## 下一步优化

可以考虑添加:
- DOCX (Word文档) 格式支持
- 自定义PDF样式和排版
- 批量导出多个商业计划
- 导出模板选择功能
