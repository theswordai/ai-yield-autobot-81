## 修改内容
删除活期理财页面（`src/pages/Flexible.tsx`）中的「等级与返佣规则」展示区块。

### 删除范围
```
{/* Rules */}
<Card className="backdrop-blur-md bg-card/40 border-border/50"> ... </Card>
```
（第 510–555 行）

### 影响说明
- 删除后不再展示「等级门槛」和「10 代返佣比例」表格
- 不影响存取、平仓、佣金领取等核心功能
- 与页面逻辑无关的 `LEVEL_RULES` 和 `COMMISSION_RATES` 静态常量也同步删除
