### async

#### callback use

- callback hell 回调地狱， 代码难以理解，跳来跳去
- trust, 不知道回调是否发生，回调执行的次数。如果使用的第三方库中的回调，会产生控制反转
  - Split callback , 成功后的回调，失败后的回调
  - error first style， 错误为回调中的第一个参数，通过该参数来判断是否执行回调
  - 在遇到不知道是同步还是异步的情况，当作一步处理

```js
// 函数异步化
function asyncify(fn) {
	const originalFunc = fn;
  let timer = setTimeout(function () {
  	timer = null;
    if (fn) fn();
  }, 0);
  fn = null;
  return function () {
  	if(timer) {
      fn = originalFunc.bind.apply(
        orginalFunc,
      	[this].concat([].slice.call(arguments))
      )
    } else {
    	// 本身是异步函数
      fn.apply(this, arguments)
    }
  }
}
```



