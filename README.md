# 女友小程序扩展
>项目为 `https://github.com/LCM9902/Duck-Princess-Cultivation-Plan`基础扩展，新增日历功能，例假记录功能

![](./miniprogram/images/3.jpg)

# 缺陷
- 例假数据存储为缓冲
- 打卡日历待添加点击事件

# Duck-Princess-Cultivation-Pla项目注意事项
### 数据库设计
https://bytedance.feishu.cn/docx/doxcnvk58QcRZxmOmHgogANvnQu

### 注意点
1. 确认project.config.json中的projectname和本地是否一致
2. miniprogram/envList.js中的环境配置改为自己的环境
3. 需要手动创建数据库表：云开发 -> 数据库

### 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

# 迭代1.2.0
- 新增云函数获取用户openID
- 新增不同用户页面展示弹框处理

![](./miniprogram/images/1.png)
