

# 修复钱包浏览器中显示默认 Lovable Logo 的问题

## 问题原因

项目中存在一个 `public/favicon.ico` 文件，这是 Lovable 的默认图标。许多钱包内置浏览器会优先读取 `/favicon.ico`，而忽略 HTML 中通过 `<link>` 标签指定的 PNG 图标。因此即使 `index.html` 中已经配置了自定义图标，钱包浏览器仍然显示默认的 Lovable logo。

## 解决方案

1. **将自定义 logo 复制为 `public/favicon.ico`**：用项目已有的自定义 logo（`/lovable-uploads/437537a7-4787-428f-b733-75aba9b434c0.png`）替换默认的 `public/favicon.ico`，确保钱包浏览器能正确加载。

2. **在 `index.html` 中补充更多 favicon 声明**：添加多种尺寸和格式的图标声明，提高各类浏览器和钱包的兼容性：
   - 添加 `sizes="192x192"` 和 `sizes="512x512"` 的图标
   - 添加 `manifest` 相关的图标配置（如有必要）

## 修改文件

- **`public/favicon.ico`** -- 用自定义 logo 替换
- **`index.html`** -- 更新 favicon 相关的 `<link>` 标签，增加兼容性声明

