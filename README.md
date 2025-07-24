<div align="center">

# 🚀 NewAPI 密钥检测工具

**现代化的 NewAPI 令牌管理与检测平台**

一个功能强大、界面美观的 NewAPI 密钥检测工具，支持多服务器管理、实时余额查询和使用历史分析。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/neko-api-key-tool)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Semi Design](https://img.shields.io/badge/Semi_Design-2.59.1-blue.svg)

</div>img

---

![项目预览图](./img.png)

## 📋 项目简介

这是一个基于 React 18 和 Semi Design 构建的 NewAPI 密钥检测工具，**Fork 自 [Calcium-Ion/neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool)**，并进行了细微修改。

### ✨ 核心特性

- 🎨 **现代化 UI 设计** - 基于 Semi Design 的美观界面，支持浅色/暗色主题
- 🌍 **多服务器管理** - 支持添加和管理多个 NewAPI 服务器实例
- 💰 **实时余额查询** - 快速检测 API 密钥余额和使用情况
- 📊 **详细使用统计** - 查看历史调用记录和消费详情
- 🔄 **自动主题切换** - 智能的浅色/暗色模式适配
- 📱 **响应式设计** - 完美支持移动端和桌面端
- ⚡ **快速部署** - 支持 Vercel 一键部署
- 🛡️ **错误边界处理** - 完善的错误处理和用户反馈

### 🆕 重构改进

相比原版本，本项目进行了以下重大改进：

#### 🎯 用户体验优化

- ❌ **移除示例界面** - 去除了不必要的 NewAPI 示例界面，直接进入功能核心
- 🔄 **智能自动跳转** - 添加自定义 BASE_URL 后自动切换到新创建的服务器
- 🎨 **全面 UI 美化** - 渐变背景、卡片式布局、图标丰富的现代化界面
- 🌙 **完美暗色适配** - 针对暗色模式进行专门的样式优化

#### 🛠️ 技术架构升级

- 📁 **标准化目录结构** - 重新组织项目文件结构，符合 React 最佳实践
- 🎭 **主题系统重构** - 完善的主题切换机制和样式适配
- 🔧 **组件化重构** - 模块化的组件设计，便于维护和扩展
- ⚡ **性能优化** - 优化渲染性能和用户交互响应

---

## 🎯 功能特性

### 💳 密钥管理

- **多格式支持**: 支持 `sk-xxx` (OpenAI)、`sess-xxx` (ChatGPT) 等多种令牌格式
- **智能验证**: 自动检测令牌格式和有效性
- **批量管理**: 支持多个密钥的统一管理

### 🌐 服务器管理

- **动态添加**: 页面内直接添加自定义 NewAPI 服务器地址
- **多实例切换**: 通过标签页快速切换不同服务器
- **智能显示**: 自动显示服务器域名，便于识别

### 📊 数据展示

- **余额信息**: 实时显示令牌总额、剩余额度、已用额度
- **使用统计**: 详细的调用历史和消费记录
- **数据导出**: 支持 CSV 格式导出调用详情
- **可视化展示**: 直观的卡片式数据展示

### 🎨 界面体验

- **现代化设计**: 采用渐变色、阴影效果的现代化界面
- **主题切换**: 完美支持浅色/暗色主题切换
- **响应式布局**: 适配各种屏幕尺寸
- **友好反馈**: 丰富的交互反馈和状态提示

---

## 🏗️ 项目结构

```
neko-api-key-tool/
├── 📁 public/                 # 静态资源
│   ├── favicon.ico            # 网站图标
│   ├── index.html             # HTML 模板
│   ├── logo192.png            # PWA 图标
│   ├── logo512.png            # PWA 图标
│   ├── manifest.json          # PWA 配置
│   └── robots.txt             # 搜索引擎配置
├── 📁 src/                    # 源代码
│   ├── 📁 components/         # React 组件
│   │   ├── HeaderBar.js       # 顶部导航栏
│   │   └── LogsTable.js       # 主要功能组件
│   ├── 📁 constants/          # 常量定义
│   │   ├── channel.constants.js
│   │   ├── common.constant.js
│   │   ├── index.js
│   │   ├── toast.constants.js
│   │   └── user.constants.js
│   ├── 📁 context/            # React Context
│   │   └── Theme/
│   │       └── index.js       # 主题上下文
│   ├── 📁 helpers/            # 工具函数
│   │   ├── api.js             # API 请求封装
│   │   ├── auth-header.js     # 认证头处理
│   │   ├── history.js         # 路由历史
│   │   ├── index.js           # 工具函数入口
│   │   ├── render.js          # 渲染工具
│   │   └── utils.js           # 通用工具
│   ├── 📁 pages/              # 页面组件
│   │   └── Log/
│   │       └── index.js       # 日志页面
│   ├── App.css                # 应用样式
│   ├── App.js                 # 应用入口组件
│   ├── index.css              # 全局样式
│   ├── index.js               # 应用入口
│   └── reportWebVitals.js     # 性能监控
├── 📄 package.json            # 项目依赖配置
├── 📄 package-lock.json       # 依赖锁定文件
├── 📄 vercel.json             # Vercel 部署配置
├── 📄 Dockerfile              # Docker 构建文件
├── 📄 .gitignore              # Git 忽略文件
└── 📄 README.md               # 项目文档
```

---

## 🚀 快速开始

### 📋 环境要求

- Node.js 16.0+
- npm 7.0+ 或 yarn 1.22+
- 现代浏览器 (Chrome 88+, Firefox 85+, Safari 14+)

### ⚡ Vercel 部署 (推荐)

1. **点击一键部署**：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/neko-api-key-tool)

2. **配置环境变量**：

   ```bash
   # 是否展示令牌余额信息
   REACT_APP_SHOW_BALANCE=true

   # 是否展示调用详情
   REACT_APP_SHOW_DETAIL=true

   # 是否展示 GitHub 图标
   REACT_APP_SHOW_ICONGITHUB=true

   # NewAPI 服务器地址 (可选)
   # 支持单个 URL 或 JSON 格式的多服务器配置
   REACT_APP_BASE_URL=https://your-newapi-domain.com
   # 或者多服务器配置：
   # REACT_APP_BASE_URL={"服务器1": "https://api1.example.com", "服务器2": "https://api2.example.com"}
   ```

3. **完成部署**：
   - 等待构建完成
   - 访问分配的 URL 开始使用
   - (可选) 绑定自定义域名

### 🐳 Docker 部署

1. **克隆项目**：

   ```bash
   git clone https://github.com/your-repo/neko-api-key-tool.git
   cd neko-api-key-tool
   ```

2. **构建镜像**：

   ```bash
   docker build -t neko-api-key-tool .
   ```

3. **运行容器**：
   ```bash
   docker run -d -p 3000:80 \
     -e REACT_APP_SHOW_BALANCE=true \
     -e REACT_APP_SHOW_DETAIL=true \
     -e REACT_APP_SHOW_ICONGITHUB=true \
     --name neko-api-key-tool \
     neko-api-key-tool
   ```

### 💻 本地开发

1. **克隆项目**：

   ```bash
   git clone https://github.com/your-repo/neko-api-key-tool.git
   cd neko-api-key-tool
   ```

2. **安装依赖**：

   ```bash
   npm install
   # 或者
   yarn install
   ```

3. **配置环境变量**：

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置相关环境变量
   ```

4. **启动开发服务器**：

   ```bash
   npm start
   # 或者
   yarn start
   ```

5. **访问应用**：
   打开浏览器访问 `http://localhost:3000`

---

## ⚙️ 配置说明

### 🔧 环境变量

| 变量名                      | 类型          | 默认值  | 说明                  |
| --------------------------- | ------------- | ------- | --------------------- |
| `REACT_APP_SHOW_BALANCE`    | boolean       | `true`  | 是否显示令牌余额信息  |
| `REACT_APP_SHOW_DETAIL`     | boolean       | `true`  | 是否显示调用详情      |
| `REACT_APP_SHOW_ICONGITHUB` | boolean       | `false` | 是否显示 GitHub 图标  |
| `REACT_APP_BASE_URL`        | string/object | -       | NewAPI 服务器地址配置 |

### 🌐 BASE_URL 配置示例

#### 单服务器配置

```bash
REACT_APP_BASE_URL=https://your-newapi-domain.com
```

#### 多服务器配置

```bash
REACT_APP_BASE_URL={"主服务器": "https://api.example.com", "备用服务器": "https://api2.example.com", "测试服务器": "https://test.example.com"}
```

---

## 📱 使用指南

### 🔑 密钥检测

1. **添加服务器** (如果未预配置)：

   - 点击 "自定义地址" 按钮
   - 输入 NewAPI 服务器地址
   - 点击 "添加" 按钮，系统会自动切换到新服务器

2. **输入密钥**：

   - 在输入框中粘贴您的 API 密钥
   - 支持多种格式：`sk-xxx`、`sess-xxx` 等
   - 按回车键或点击 "检测" 按钮

3. **查看结果**：
   - **令牌信息**：查看总额、剩余额度、已用额度、有效期
   - **调用详情**：查看历史调用记录、模型使用情况、消费统计

### 🎨 主题切换

- 点击右上角的 🌙/☀️ 图标切换主题
- 支持浅色和暗色两种主题
- 主题选择会自动保存到本地存储

### 📊 数据管理

- **复制信息**：点击 "复制令牌信息" 快速复制所有余额数据
- **导出数据**：点击 "导出 CSV" 下载详细的调用记录
- **服务器切换**：通过标签页在多个服务器间切换

---

## 🛠️ 技术栈

### 🎯 核心技术

- **React 18.2.0** - 现代化的前端框架
- **Semi Design 2.59.1** - 抖音出品的企业级 UI 组件库
- **Axios 0.27.2** - HTTP 请求库
- **Papa Parse 5.4.1** - CSV 解析和生成库

### 🎨 UI/UX

- **Semi Icons** - 丰富的图标库
- **CSS3 渐变** - 现代化的视觉效果
- **响应式设计** - 适配各种设备
- **主题系统** - 完善的浅色/暗色主题支持

### 🔧 开发工具

- **Create React App** - 零配置的开发环境
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Web Vitals** - 性能监控

---

## 🤝 贡献指南

我们非常欢迎社区贡献！请按照以下步骤参与项目：

### 🚀 快速贡献

1. **Fork 项目**到您的 GitHub 账户
2. **创建特性分支**：`git checkout -b feature/AmazingFeature`
3. **提交更改**：`git commit -m 'Add some AmazingFeature'`
4. **推送分支**：`git push origin feature/AmazingFeature`
5. **创建 Pull Request**

### 📝 开发规范

- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加适当的注释和文档
- 确保代码通过所有测试

### 🐛 问题报告

如果您发现了 bug 或有功能建议，请：

1. 查看现有的 [Issues](https://github.com/your-repo/neko-api-key-tool/issues)
2. 如果没有相关问题，创建新的 Issue
3. 提供详细的问题描述和复现步骤

---

## 📄 开源协议

本项目基于 **MIT 协议** 开源，详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- 感谢 [Calcium-Ion/neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool) 提供的原始项目基础
- 感谢 [Calcium-Ion/new-api](https://github.com/Calcium-Ion/new-api) 提供的 NewAPI 项目
- 感谢 [Semi Design](https://semi.design/) 提供的优秀 UI 组件库
- 感谢所有为这个项目贡献代码和建议的开源贡献者

---

## 📞 支持与反馈

如果您觉得这个项目有用，请给我们一个 ⭐ Star！

- 🐛 **问题反馈**：[GitHub Issues](https://github.com/your-repo/neko-api-key-tool/issues)
- 💡 **功能建议**：[GitHub Discussions](https://github.com/your-repo/neko-api-key-tool/discussions)
- 📧 **联系我们**：通过 GitHub 联系项目维护者

---

<div align="center">

**🚀 开始使用 NewAPI 密钥检测工具，享受现代化的 API 管理体验！**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/neko-api-key-tool)

_Made with ❤️ by the community_

</div>
