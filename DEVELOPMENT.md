# 貸款計算機 - 開發筆記

> 本文件供未來開發者（包括 AI）參考，記錄專案架構、功能實現與版本變更歷史。

## 專案概述

貸款計算機是一個純前端的 Web 應用程式，用於計算各類貸款的還款計劃，支援多語言、多幣別、多主題，並提供視覺化圖表與匯出功能。

**技術棧**：純 HTML + CSS + JavaScript（無框架）

**外部依賴**：
- Chart.js 4.x - 圖表繪製
- jsPDF 2.5.x - PDF 匯出
- jsPDF-AutoTable 3.5.x - PDF 表格
- SheetJS (xlsx) 0.18.x - Excel 匯出

---

## 檔案結構

```
貸款計算機/
├── index.html      # 主頁面結構
├── styles.css      # 樣式與主題定義
├── i18n.js         # 國際化系統（翻譯與幣別）
├── calculator.js   # 貸款計算核心邏輯
├── app.js          # 應用程式主控制器
└── DEVELOPMENT.md  # 本開發筆記
```

---

## 核心模組說明

### 1. i18n.js - 國際化系統

**I18n 類別**：管理語言與幣別切換

```javascript
// 使用方式
i18n.setLanguage('zh');           // 設定語言
i18n.setCurrency('TWD');          // 設定幣別
i18n.t('keyName');                // 取得翻譯文字
i18n.formatCurrency(1000000);     // 格式化金額 → "NT$1,000,000"
i18n.formatPercent(2.5);          // 格式化百分比 → "2.50%"
```

**支援語言**：
| 代碼 | 語言 | Locale |
|------|------|--------|
| zh | 繁體中文 | zh-TW |
| en | English | en-US |
| ja | 日本語 | ja-JP |

**支援幣別**：
| 代碼 | 符號 | 小數位 |
|------|------|--------|
| TWD | NT$ | 0 |
| JPY | ¥ | 0 |
| USD | $ | 2 |

**新增語言步驟**：
1. 在 `translations` 物件新增語言鍵值
2. 複製現有語言結構，翻譯所有文字
3. 在 `getLocale()` 新增對應的 locale
4. 在 `index.html` 的語言選單新增選項

**新增幣別步驟**：
1. 在 `currencies` 物件新增幣別設定
2. 設定 `symbol`、`name`（各語言名稱）、`decimals`
3. 在 `index.html` 的幣別選單新增選項

---

### 2. calculator.js - 計算引擎

**LoanCalculator 類別**：執行所有貸款計算

**主要方法**：

```javascript
const calculator = new LoanCalculator();

// 計算還款計劃
const result = calculator.calculate({
    principal: 1000000,      // 貸款本金
    annualRate: 2.0,         // 年利率 (%)
    termMonths: 240,         // 貸款期數（月）
    gracePeriod: 0,          // 寬限期（月）
    method: 'equalPayment',  // 還款方式
    additionalCosts: 5000    // 額外費用
});
```

**還款方式**：

| 方法 | 說明 | 特點 |
|------|------|------|
| `equalPayment` | 本息平均攤還（等額本息） | 每月還款金額固定 |
| `equalPrincipal` | 本金平均攤還（等額本金） | 每月本金固定，利息遞減 |

**寬限期計算邏輯**：
- 寬限期內：只繳利息，不還本金
- 月付金額 = 本金 × 月利率
- 寬限期結束後，以剩餘期數重新計算正常還款

**APR（總費用年百分率）計算**：
- 使用 IRR（內部報酬率）方法
- 將所有額外費用納入計算
- 公式：找出使 NPV = 0 的月利率，再轉換為年利率
- 實現：二分法迭代求解

```javascript
// APR 計算核心邏輯
calculateIRR(principal, upfrontCosts, schedule, totalMonths) {
    const netReceived = principal - upfrontCosts;
    // 二分法求解使 NPV = 0 的利率
    // 回傳年化百分率
}
```

---

### 3. app.js - 應用控制器

**主要職責**：
- DOM 事件綁定
- 使用者輸入驗證
- 呼叫計算引擎
- 更新 UI 與圖表
- 處理匯出與分享

**主題系統**：

```javascript
const themes = ['light', 'dark', 'night'];
const themeIcons = {
    light: '🌤️',
    dark: '🌙',
    night: '🌃'
};
```

切換邏輯：點擊按鈕循環切換 → light → dark → night → light...

**額外費用管理**：
- 動態新增/刪除費用項目
- 即時計算總額外費用
- 費用納入 APR 計算

**圖表配置**：

| 圖表 | 類型 | 資料 |
|------|------|------|
| paymentChart | Line | 每期還款金額趨勢 |
| balanceChart | Line | 累計本金 + 累計利息 |

**匯出功能**：

| 格式 | 函式 | 說明 |
|------|------|------|
| CSV | `exportToCSV()` | 純文字，逗號分隔 |
| Excel | `exportToExcel()` | 使用 SheetJS |
| PDF | `exportToPDF()` | 使用 jsPDF + AutoTable |

**分享功能**：
- 使用 Web Share API
- 不支援時顯示提示訊息

---

### 4. styles.css - 樣式系統

**CSS 變數主題架構**：

```css
.theme-light {
    --bg-primary: #f8fafc;
    --text-primary: #1e293b;
    /* ... */
}

.theme-dark {
    --bg-primary: #1e293b;
    --text-primary: #f1f5f9;
    /* ... */
}

.theme-night {
    --bg-primary: #0f0f23;
    --text-primary: #e2e8f0;
    /* ... */
}
```

**新增主題步驟**：
1. 在 CSS 新增 `.theme-{name}` 類別
2. 定義所有 CSS 變數
3. 在 `app.js` 的 `themes` 陣列新增主題名稱
4. 在 `themeIcons` 新增對應圖示

**響應式斷點**：
- `768px` - 平板/手機切換
- `480px` - 小螢幕調整

---

## 版本變更記錄

### v1.0.0 (2024-01-03) - 初始版本

**核心功能**：
- ✅ 多語言支援（中文/英文/日文）
- ✅ 多幣別支援（台幣/日幣/美金）
- ✅ 三種主題模式（淺色/深色/夜間）
- ✅ 單鍵循環切換主題
- ✅ 貸款類型選擇（房貸/車貸/信貸/其他）
- ✅ 自訂貸款類型輸入
- ✅ 兩種還款方式
  - 本息平均攤還（等額本息）
  - 本金平均攤還（等額本金）
- ✅ 寬限期功能（期間內只繳利息）
- ✅ 額外費用動態新增/刪除
- ✅ 總費用年百分率（APR）計算
- ✅ 還款趨勢圖（Chart.js）
- ✅ 本金利息累計圖
- ✅ 還款明細表
- ✅ 匯出功能（CSV/Excel/PDF）
- ✅ 分享功能（Web Share API）
- ✅ 響應式設計
- ✅ LocalStorage 偏好儲存

**UI/UX 設計決策**：
- 貸款成數/年限/利率採用緊湊水平排列
- 輸入框與單位整合於同一列
- 主題切換使用單一按鈕循環切換（減少視覺複雜度）
- Q 版表情符號圖示增加親和感

---

## 未來開發建議

### 可能的功能擴展

1. **提前還款計算**
   - 一次性還款
   - 縮短年限 vs 減少月付

2. **利率變動計算**
   - 階段式利率
   - 機動利率預測

3. **多筆貸款比較**
   - 並排比較不同方案
   - 視覺化差異

4. **還款提醒**
   - 連接行事曆
   - 通知功能

5. **資料持久化**
   - 儲存計算歷史
   - 雲端同步

### 效能優化建議

1. **大量期數優化**
   - 表格虛擬滾動（超過 120 期時）
   - 圖表資料抽樣

2. **圖表延遲載入**
   - 使用 IntersectionObserver
   - 減少初始載入時間

### 程式碼品質建議

1. **TypeScript 遷移**
   - 增加型別安全
   - 改善 IDE 支援

2. **單元測試**
   - 計算邏輯測試
   - 邊界條件驗證

3. **模組化打包**
   - 使用 Vite/Webpack
   - 最小化生產版本

---

## 常見問題排解

### Q: 圖表不顯示
**A**: 確認 Chart.js CDN 載入成功，檢查瀏覽器 Console 錯誤訊息。

### Q: PDF 匯出中文亂碼
**A**: jsPDF 預設不支援中文，目前使用基本 Latin 字型。完整中文支援需要：
1. 嵌入中文字型檔案
2. 或改用支援 Unicode 的 PDF 函式庫

### Q: Excel 匯出數字變文字
**A**: SheetJS 會自動偵測資料型別，確保傳入數值而非字串。

### Q: 計算結果與銀行不同
**A**: 可能原因：
1. 銀行使用不同的天數計算基礎（360天 vs 365天）
2. 銀行有額外隱藏費用
3. 利率計算方式差異（單利 vs 複利）

---

## 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 授權

此專案採用 MIT 授權條款。

---

*最後更新：2024-01-03*
