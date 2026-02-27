---
name: add-si-api
description: 为 systeminformation 库添加新的 API 功能的标准化流程
---

# 为 systeminformation 库添加新 API

这个 skill 用于标准化地为 systeminformation 库添加新的 API 功能。

## 使用方法

用户输入需求，例如：
- "创建一个获取 IP 地址的 API"
- "添加一个获取系统温度的 API"
- "实现一个获取网络速度的 API"

## 工作流程

### 阶段 1: 需求确认

#### 步骤 1.1: 理解需求
- 分析用户需求，确定要实现的功能
- 确定 API 名称（遵循 camelCase 命名规范）
- 确定返回数据结构
- 确定是否需要参数

#### 步骤 1.2: 与用户核对
使用 AskUserQuestion 工具向用户确认以下信息：

**问题 1: API 基本信息**
- 选项 1: API 名称建议
- 选项 2: 返回数据结构建议
- 选项 3: 是否需要参数

**问题 2: 实现策略**
- 选项 1: 使用现有函数组合
- 选项 2: 实现新的底层逻辑
- 选项 3: 需要智能过滤/排序

**问题 3: 优先级规则**（如果需要）
- 选项 1: 按类型优先（如：有线 > 无线）
- 选项 2: 按数值优先（如：速度、温度）
- 选项 3: 按状态优先（如：活动 > 非活动）

等待用户确认后再继续。

---

### 阶段 2: 核心实现

#### 步骤 2.1: 实现主函数
**文件**: `lib/[module].js`（如 `lib/network.js`, `lib/system.js` 等）

**实现内容**:
```javascript
// --------------------------
// [MODULE] - [Function Description]

function [functionName](callback) {
  return new Promise((resolve) => {
    process.nextTick(() => {
      // 实现逻辑
      // 1. 获取数据
      // 2. 过滤数据（如果需要）
      // 3. 排序数据（如果需要）

      const result = {
        // 返回数据结构
      };

      if (callback) {
        callback(result);
      }
      resolve(result);
    });
  });
}

exports.[functionName] = [functionName];
```

**关键点**:
- 支持 Promise 和 callback 两种调用方式
- 使用 `process.nextTick()` 确保异步执行
- 错误处理要完善

#### 步骤 2.2: 添加 TypeScript 类型定义
**文件**: `lib/index.d.ts`

**添加内容**:
```typescript
// 1. 在 Systeminformation namespace 中添加接口
interface [DataName]Data {
  field1: type;
  field2: type;
  // ...
}

// 2. 在文件末尾添加函数声明
export function [functionName](
  cb?: (data: Systeminformation.[DataName]Data) => any
): Promise<Systeminformation.[DataName]Data>;
```

#### 步骤 2.3: 导出函数
**文件**: `lib/index.js`

**添加内容**:
```javascript
// 在相应的模块导出区域添加
exports.[functionName] = [module].[functionName];
```

---

### 阶段 3: 添加测试

#### 步骤 3.1: 分配测试按键
**规则**:
- 网络功能: 10-19
- Docker功能: 21-29
- 系统功能: 30-39
- 聚合数据: 0-9

**分配策略**:
1. **已存在的模块**: 在该模块的最后一个按键编号上 +1
   - 例如：网络功能已有 10-15，新增网络功能使用 16
   - 例如：Docker功能已有 21-26，新增Docker功能使用 27

2. **新增的模块**: 使用新的编号范围开始
   - 例如：新增音频功能，使用 50-59 范围
   - 例如：新增打印机功能，使用 60-69 范围

3. **查找当前最大编号**:
   ```bash
   # 查看 test/si.js 中已使用的按键
   grep "else if (f ===" test/si.js | grep -o "'[0-9]*'" | sort -n
   ```

选择一个未使用的按键编号。

#### 步骤 3.2: 添加测试用例
**文件**: `test/si.js`

**添加内容**:
```javascript
else if (f === '[key]') {
  si.[functionName]().then((data) => {
    if (data !== null) {
      resolve({ data, title: '[Test Title]' });
    } else {
      resolve('not_supported');
    }
  });
}
```

#### 步骤 3.3: 更新测试菜单
**文件**: `test/test.js`

在 `printMenu()` 函数中添加菜单项：
```javascript
│  [key] .. [Function Description]
```

#### 步骤 3.4: 运行测试
```bash
cd test
node si.js [key]
```

验证返回结果是否符合预期。

---

### 阶段 4: 文档编写

#### 步骤 4.1: 创建 API 使用文档
**文件**: `docs/[FUNCTION_NAME].md`

**内容结构**:
```markdown
# [functionName]() 函数使用说明

## 功能描述
[详细描述功能]

## 返回值
[描述返回数据结构]

## 使用方法
### 1. 使用 Promise
[示例代码]

### 2. 使用 async/await
[示例代码]

### 3. 使用回调函数
[示例代码]

## 示例输出
[JSON 示例]

## 使用场景
[列出适用场景]

## 注意事项
[列出注意事项]

## 相关函数
[列出相关函数]
```

#### 步骤 4.2: 更新 README.md
在 README.md 的相应章节添加新 API 的说明：
```markdown
### [Category]
- `[functionName]()` - [简短描述]
```

---

### 阶段 5: 最终验证

#### 步骤 5.1: 代码检查
- [ ] TypeScript 类型定义正确
- [ ] 函数已正确导出
- [ ] 支持 Promise 和 callback
- [ ] 错误处理完善

#### 步骤 5.2: 测试验证
- [ ] 单元测试通过
- [ ] 返回数据格式正确
- [ ] 边界情况处理正确

#### 步骤 5.3: 文档检查
- [ ] API 文档完整
- [ ] 示例代码可运行
- [ ] README 已更新

#### 步骤 5.4: 向用户报告
生成完成报告，包含：
- 修改的文件列表
- 测试结果
- 使用示例
- 文档链接

---

## 示例：添加 getIpAddress API

### 需求
创建一个获取 IP 地址的 API

### 确认信息
- **API 名称**: `getIpAddress`
- **返回结构**: `{ip4: string, ip6: string, iface: string}`
- **实现策略**: 智能过滤和排序
- **优先级**: 有线 > 无线, 192.168.x.x > 10.x.x.x

### 实现文件
1. `lib/network.js` - 核心实现 (+116行)
2. `lib/index.d.ts` - 类型定义 (+7行)
3. `lib/index.js` - 函数导出 (+1行)
4. `test/si.js` - 测试用例 (+1行)
5. `test/test.js` - 测试菜单 (+1行)

### 测试按键
`15` - Get IP Address

### 文档
- `docs/GET_IP_ADDRESS.md` - 使用文档

---

## 注意事项

1. **命名规范**: 遵循 camelCase，与现有 API 风格一致
2. **错误处理**: 所有异步操作都要有错误处理
3. **向后兼容**: 不要破坏现有 API
4. **性能考虑**: 避免阻塞操作，使用异步
5. **文档完整**: 确保文档清晰、示例可运行
6. **测试覆盖**: 至少包含基本功能测试

---

## 检查清单

在完成实现后，使用此清单验证：

- [ ] 需求已与用户确认
- [ ] 核心函数已实现
- [ ] TypeScript 类型已定义
- [ ] 函数已导出
- [ ] 测试用例已添加
- [ ] 测试菜单已更新
- [ ] 测试通过
- [ ] API 文档已创建
- [ ] README 已更新
- [ ] 代码未提交（等待用户确认）

---

## 工作流程图

```
用户提出需求
    ↓
理解需求 → 确定 API 名称、返回结构
    ↓
与用户核对 → 使用 AskUserQuestion
    ↓
用户确认 ✓
    ↓
实现核心函数 → lib/[module].js
    ↓
添加类型定义 → lib/index.d.ts
    ↓
导出函数 → lib/index.js
    ↓
添加测试用例 → test/si.js
    ↓
更新测试菜单 → test/test.js
    ↓
运行测试验证
    ↓
创建 API 文档 → docs/[FUNCTION_NAME].md
    ↓
更新 README → README.md
    ↓
最终验证 → 检查清单
    ↓
向用户报告完成
```

---

## 常见问题

### Q: 如何选择合适的模块文件？
A: 根据功能类型选择：
- 网络相关 → `lib/network.js`
- 系统相关 → `lib/system.js`
- CPU相关 → `lib/cpu.js`
- 内存相关 → `lib/memory.js`
- 磁盘相关 → `lib/filesystem.js`

### Q: 如何处理平台差异？
A: 使用平台检测：
```javascript
const _darwin = process.platform === 'darwin';
const _windows = process.platform === 'win32';
const _linux = process.platform === 'linux';

if (_darwin) {
  // macOS 实现
} else if (_windows) {
  // Windows 实现
} else if (_linux) {
  // Linux 实现
}
```

### Q: 如何分配测试按键？
A: 遵循分组规则：
- 10-19: 网络功能
- 21-29: Docker功能
- 30-39: 系统功能
- 0-9: 聚合数据

**分配策略**:
1. **已存在的模块**: 在该模块的最后一个按键编号上 +1
   - 例如：网络功能已有 10-15，新增网络功能使用 16
   - 例如：Docker功能已有 21-26，新增Docker功能使用 27

2. **新增的模块**: 使用新的编号范围开始
   - 例如：新增音频功能，使用 50-59 范围
   - 例如：新增打印机功能，使用 60-69 范围

3. **查找当前最大编号**:
   ```bash
   # 查看 test/si.js 中已使用的按键
   grep "else if (f ===" test/si.js | grep -o "'[0-9]*'" | sort -n
   ```

选择对应分组中未使用的编号。

---

## 结束语

遵循此 skill 的流程，可以确保：
- ✅ 实现标准化
- ✅ 代码质量高
- ✅ 文档完整
- ✅ 测试覆盖
- ✅ 用户满意
