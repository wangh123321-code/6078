# 纯种猫血统管理系统

基于区块链存证的纯种猫血统管理系统，使用Spring Boot + MongoDB + React技术栈开发。

## 功能特性

### 🐱 猫咪注册
- 录入猫咪基本信息（编号、名称、品种、性别、毛色等）
- 上传父母血统证明，自动关联父母信息
- 系统自动生成五代系谱图
- 支持添加获奖记录

### 🔗 区块链存证
- 每只猫咪信息写入后同步到区块链
- 生成唯一的哈希值存证，数据不可篡改
- 支持区块链完整性验证
- 所有历史操作可追溯

### 📄 证书生成
- PDF格式血统证书自动生成
- 证书包含二维码，扫码可验证真伪
- 数字水印防伪造
- 包含完整的区块链存证信息

### 💕 繁育管理
- 记录配对信息、交配日期
- 自动计算预产期
- 小猫出生后自动关联父母血统
- 繁育状态跟踪（待配种→已交配→已怀孕→已出生）

### 🔐 权限管理
三级角色权限控制：
- **超级管理员**：系统管理、用户管理、所有数据操作
- **猫舍管理员**：猫咪管理、繁育管理、证书生成
- **普通用户**：查询血统、验证证书

### 📊 批量操作
- Excel批量导入猫咪数据
- 支持导出Excel数据
- 提供导入模板下载

## 技术栈

### 后端
- Spring Boot 3.2.0
- Spring Security + JWT
- Spring Data MongoDB
- Lombok
- iText PDF（证书生成）
- ZXing（二维码生成）
- Apache POI（Excel处理）

### 前端
- React 18
- React Router 6
- Ant Design 5
- Axios
- Zustand（状态管理）
- Vite（构建工具）

### 基础设施
- MongoDB 6.0
- Nginx
- Docker + Docker Compose

## 快速启动

### 方式一：Docker Compose启动（推荐）

```bash
# 1. 克隆项目到本地
cd cat-pedigree-system

# 2. 构建并启动所有服务
docker-compose up -d --build

# 3. 查看服务状态
docker-compose ps

# 4. 停止服务
docker-compose down
```

启动后访问：
- 前端：http://localhost
- 后端API：http://localhost:8080/api
- MongoDB：mongodb://admin:admin123@localhost:27017

### 方式二：本地开发启动

#### 启动MongoDB
```bash
docker run -d --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -e MONGO_INITDB_DATABASE=cat_pedigree \
  mongo:6.0
```

#### 启动后端
```bash
cd backend
mvn clean package -DskipTests
java -jar target/cat-pedigree-backend-1.0.0.jar
```

#### 启动前端
```bash
cd frontend
npm install
npm run dev
```

## 默认测试账号

系统启动时会自动创建以下测试账号：

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 超级管理员 | admin | admin123 | 所有权限 |
| 猫舍管理员 | cattery | cattery123 | 猫咪管理、繁育、证书 |
| 普通用户 | user | user123 | 查询、验证 |

## API接口文档

### 认证接口
```
POST /api/auth/login - 登录
POST /api/auth/register - 注册
GET  /api/auth/me - 获取当前用户信息
```

### 猫咪接口
```
GET    /api/cats - 获取猫咪列表（分页）
GET    /api/cats/{catNo} - 根据编号查询猫咪
POST   /api/cats - 新增猫咪
PUT    /api/cats/{id} - 更新猫咪信息
GET    /api/cats/pedigree/{catNo} - 获取五代系谱图
GET    /api/cats/search - 搜索猫咪
POST   /api/cats/{id}/awards - 添加获奖记录
DELETE /api/cats/{id} - 删除猫咪
```

### 繁育接口
```
GET    /api/breedings - 获取繁育列表
POST   /api/breedings - 新增繁育记录
PATCH  /api/breedings/{id}/status - 更新繁育状态
POST   /api/breedings/{id}/kittens - 关联幼猫
```

### 证书接口
```
POST   /api/certificates/cat/{catId} - 生成证书
GET    /api/certificates/{certificateNo} - 获取证书信息
GET    /api/certificates/verify?code=xxx - 验证证书
GET    /api/certificates/{certificateNo}/download - 下载证书PDF
```

### 区块链接口
```
GET    /api/blockchain/verify/{catNo} - 验证区块链数据完整性
GET    /api/blockchain/cat/{catNo} - 获取猫咪的区块链记录
GET    /api/blockchain/latest - 获取最新区块信息
```

### Excel接口
```
POST   /api/excel/import - 批量导入猫咪数据
GET    /api/excel/export - 导出猫咪数据
GET    /api/excel/template - 下载导入模板
```

## 项目目录结构

```
cat-pedigree-system/
├── docker-compose.yml          # Docker Compose配置
├── backend/                    # 后端项目
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/catpedigree/
│       ├── CatPedigreeApplication.java    # 启动类
│       ├── common/             # 通用类
│       ├── controller/         # REST API控制器
│       ├── dto/                # 数据传输对象
│       ├── enums/              # 枚举类
│       ├── model/              # 数据模型
│       ├── repository/         # 数据访问层
│       ├── security/           # 安全认证
│       └── service/            # 业务逻辑层
├── frontend/                   # 前端项目
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                # API接口
│       ├── components/         # 通用组件
│       ├── pages/              # 页面组件
│       ├── store/              # 状态管理
│       ├── utils/              # 工具函数
│       └── ...
└── README.md
```

## 核心业务流程

### 猫咪注册流程
1. 猫舍管理员登录系统
2. 录入猫咪基本信息
3. 填写父母猫咪编号（系统自动关联）
4. 提交后自动同步到区块链，生成哈希存证
5. 系统生成五代系谱图

### 证书生成流程
1. 选择已上链的猫咪
2. 点击"生成证书"
3. 系统自动生成PDF证书（含二维码、数字水印、区块链信息）
4. 下载PDF证书

### 证书验证流程
1. 手机扫描证书二维码或访问验证页面
2. 输入证书验证码
3. 系统验证区块链数据完整性
4. 返回验证结果和证书详细信息

### 繁育管理流程
1. 创建繁育记录，填写父母猫咪编号
2. 系统自动计算预产期（交配日期+65天）
3. 更新繁育状态（已交配→已怀孕）
4. 幼猫出生后，录入幼猫信息
5. 系统自动关联幼猫与父母的血统关系

## 区块链存证说明

系统采用模拟区块链实现，核心机制：

1. **哈希计算**：使用SHA-256算法对猫咪数据计算哈希值
2. **区块结构**：每个区块包含前一区块哈希、数据哈希、时间戳、区块号
3. **链式验证**：通过哈希链条确保数据不可篡改
4. **Merkle树**：支持批量数据验证

## 注意事项

1. 生产环境请务必修改默认密码和JWT密钥
2. MongoDB数据卷已配置持久化，删除容器不会丢失数据
3. 证书PDF已内置数字水印和二维码，可有效防止伪造
4. 所有操作都会记录日志，便于审计追踪

## 许可证

MIT License
