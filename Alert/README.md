# Alert

> 具有拖拉功能，

提供以下方法
* async Alert.showMessage(message, options) : Promise
* async Alert.prompt(message, defaultValue, options) : Promise
* async Alert.confirm(message, options) : Promise

showMessage的Promise沒有值

prompt的Promise的值為使用者在輸入框輸入的值或預設值。

confirm的Promise的值為使用者選擇的結果。

方法都具有以下選項

| Option      | 用意     |
|-------------|----------|
| headerText  | 標題文字 |
| messageBody | 訊息內容 |
| textAlign   | 內容對齊 |
| buttonText  | 按紐文字 |

而比較特別的是prompt方法的options包含input元素的所有option

[使用範例](https://laijunbin.github.io/js_library/Alert)