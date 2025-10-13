# 音效文件说明

## 实现方案

本项目采用了**双重音效方案**：
1. **MP3文件播放** - 优先使用高质量音效文件
2. **Web Audio API生成** - 当MP3文件不存在时自动回退

## 支持的音效类型

### 评估系统音效
1. **assessment-complete** - 评估完成音效
2. **workshop-unlock** - 工作坊解锁音效
3. **button-click** - 按钮点击音效
4. **score-tick** - 分数滚动音效
5. **transition-whoosh** - 过渡音效

### 工作坊新增音效
6. **step-complete** - 步骤完成音效
7. **form-save** - 表单保存音效
8. **agent-message** - AI消息音效
9. **pdf-download** - PDF下载音效
10. **workshop-start** - 工作坊开始音效

## 技术实现

### 1. 自动回退机制
```typescript
// 优先尝试MP3文件
const audio = new Audio(`/sounds/${soundName}.mp3`)

// 失败时自动切换到生成音效
await soundPlayer.playSound(soundName)
```

### 2. Web Audio API生成
系统使用不同的波形生成各种音效：
- **beep** - 纯正弦波
- **ding** - 带衰减的正弦波
- **chord** - 三和弦（根音、三度、五度）
- **sweep** - 频率扫描
- **tick** - 短促脉冲
- **whoosh** - 噪声扫频

### 3. 音效配置
每个音效都有独立的配置：
```typescript
{
  type: 'ding',
  frequency: 800,    // 频率 (Hz)
  duration: 1.2,     // 时长 (秒)
  volume: 0.5,       // 音量 (0-1)
  fadeOut: true      // 淡出效果
}
```

## 使用方法

### 1. 在组件中使用
```typescript
import { useSoundEffects } from '@/hooks/useSoundEffects'

function MyComponent() {
  const { playSound } = useSoundEffects(true, 0.6) // 启用，音量60%

  const handleClick = async () => {
    await playSound('button-click')
  }
}
```

### 2. 全局播放器
```typescript
import { playSound } from '@/lib/sound-generator'

// 直接播放
await playSound('workshop-unlock')
```

## 开发状态

✅ **已完成**：
- Web Audio API音效生成系统
- 自动回退机制
- 工作坊集成
- 音效配置管理

⏳ **可选改进**：
- 添加真实MP3音效文件
- 音效可视化界面
- 用户音量控制
- 更多音效类型

## 添加真实音效文件

如需使用真实音效文件，请将MP3文件放置在 `public/sounds/` 目录：

```
public/sounds/
├── assessment-complete.mp3
├── workshop-unlock.mp3
├── button-click.mp3
├── score-tick.mp3
├── transition-whoosh.mp3
├── step-complete.mp3
├── form-save.mp3
├── agent-message.mp3
├── pdf-download.mp3
└── workshop-start.mp3
```

### 推荐音效资源
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) - 免费商用
- [Freesound](https://freesound.org/) - 开源音效
- [Zapsplat](https://www.zapsplat.com/) - 免费音效

## 音效规范

### 文件格式
- **格式**：MP3
- **采样率**：44.1kHz 或 48kHz
- **比特率**：128kbps 或更高
- **声道**：单声道或立体声

### 音量和时长
- **按钮点击**：0.1-0.3秒，音量较低
- **成功提示**：1-2秒，音量中等
- **庆祝音效**：2-3秒，音量中等偏高
- **背景音效**：0.5-1秒，音量适中

### 音效特性
- 干净无杂音
- 适合办公环境
- 不过于突兀或尖锐
- 符合产品调性

## 性能优化

### 1. 预加载
```typescript
const { preloadSound } = useSoundEffects()

// 预加载常用音效
await preloadSound('button-click')
await preloadSound('form-save')
```

### 2. 缓存管理
- MP3文件自动缓存
- Web Audio缓存生成的AudioBuffer
- 组件卸载时清理资源

### 3. 内存管理
```typescript
// 清理资源
soundPlayer.dispose()
```

## 测试建议

1. **功能测试**：确保所有音效都能正常播放
2. **性能测试**：检查内存使用和加载时间
3. **用户体验测试**：音效时机和音量是否合适
4. **兼容性测试**：不同浏览器的Web Audio支持
