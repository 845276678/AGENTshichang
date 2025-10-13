# 音效文件说明

## 文件列表

由于音频文件较大，这里列出需要的音效文件清单。您可以从以下开源音效库获取：

### 推荐音效库
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) - 免费商用
- [Freesound](https://freesound.org/) - 开源音效
- [Zapsplat](https://www.zapsplat.com/) - 免费音效

### 需要的音效文件

1. **assessment-complete.mp3** (评估完成音效)
   - 类型: 成功提示音
   - 时长: 1-2秒
   - 音量: 中等
   - 建议: 清脆的铃声或"叮"的一声

2. **workshop-unlock.mp3** (工作坊解锁音效)
   - 类型: 庆祝音效
   - 时长: 2-3秒
   - 音量: 中等偏高
   - 建议: 上升的音阶或成就解锁音效

3. **button-click.mp3** (按钮点击音效)
   - 类型: UI反馈音
   - 时长: 0.1-0.3秒
   - 音量: 低
   - 建议: 轻微的"咔哒"声

4. **score-tick.mp3** (分数滚动音效)
   - 类型: 计数音效
   - 时长: 0.05秒
   - 音量: 低
   - 建议: 短促的"滴"声

5. **transition-whoosh.mp3** (过渡音效)
   - 类型: 转场音效
   - 时长: 0.5-1秒
   - 音量: 中等
   - 建议: "嗖"的一声

## 临时方案

在没有真实音效文件的情况下，系统会：
1. 自动跳过音效播放
2. 不影响动画效果
3. 在控制台输出日志：`🔇 音效文件不存在: {filename}`

## 添加音效文件

将下载的音效文件放在此目录下：
```
public/sounds/
├── assessment-complete.mp3
├── workshop-unlock.mp3
├── button-click.mp3
├── score-tick.mp3
└── transition-whoosh.mp3
```

## 使用说明

用户可以在设置中开启/关闭音效：
- 默认：关闭
- 位置：竞价页面右上角设置按钮
- 音量：可调节（0-100%）
