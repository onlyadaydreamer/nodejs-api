- 登录接口需要在登录后把 token 在 postman 中 中设置为全局变量，可以在 Tests 这一项中添加以下脚本

```js
var jsonData = pm.response.json();
pm.globals.set('token', jsonData.token);
```
