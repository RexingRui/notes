/**
 * 闭包
 * Object.prototype.toString
 * target作为参数，使用call以函数的形式调用
 * 返回target的类型
 */
function isType(type) {
  return function (target) {
    return `[object ${type}]` === Object.prototype.toString.call(target)
  }
}

/**
 * 稀疏数组的处理
 * 
 */
function selfMap(fn, context) {
  let arr = Array.prototype.slice.call(this);

  let mappedArr = Array();

  for (let i = 0; i < arr.length; i++) {
    if (!arr.hasOwnProperty(i)) continue;
    mappedArr[i] = fn.call(context, arr[i], i, this);
  }
  return mappedArr;
}
/**
 * reduce的使用
 */
function selfMap2(fn, context) {
  const arr = Array.prototype.slice.call(this);
  return arr.reduce((pre, cur, index) => [...pre, fn.call(context, cur, index, this)], [])
}

function selfReduce(fn, initial) {
  const arr = Array.prototype.slice.call(this);
  const res = initial ? initial : getFirstValueOfArr(arr);
  for (let i = ++res.index || res; i < arr.length; i++) {
    res = fn.call(null, res, arr[i], i, this)
  }
}

function getFirstValueOfArr(arr) {
  for (let i = 0, len = arr.length; i< len; i++) {
    if (arr.hasOwnProperty(i)) {
      return {index: i, value: arr[i]};
    }
  }
}

function selfFlat (depth = 1) {
  const arr = Array.prototype.slice.call(this);
  let flatArr = [];
  (function flat(arr, depth) {
    for (let i = 0, len = arr.length; i < len;i++) {
      if (!arr.hasOwnProperty[i]) continue;
      const value = arr[i];
      if (Array.isArray(value) && depth > 0) {
        flat( value, depth - 1);
      } else {
        flatArr.push(value);
      }
    }
  })(arr, depth)
 

  return flatArr;

}

/**
 * class实现
 * Object.create
 * Object.setPrototypeOf
 */
function inherit(subType, superType) {
  subType.prototype = Object.create(superType.prototype, {
    constructor: {
      enumerable: false,
      configurable: true,
      writable: false,
      value: subType
    }
  });

  Object.setPrototypeOf(subType, superType)
}

#### 打包编译

- 使用[compression-webpack-plugin](https://www.webpackjs.com/plugins/compression-webpack-plugin/)对打包后对js, css代码gz压缩，后端响应头部需要将Content-Encoding: gzip.浏览器自动解压压缩后的文件
- 使用[SplitChunksPlugin](https://webpack.docschina.org/plugins/split-chunks-plugin/),对大体积的包进行分块处理，并按需加载

#### 目录结构

- 添加views目录，将AppMed, AppAnno改成页面组件。App.vue中添加router-view, 在路由中配置页面组件（动态导入）
- 添加环境变量配置文件，从而在不同的环境下(dev/pro/test)定义不同的配置常量。
- 建议参考[vue 风格指南](https://cn.vuejs.org/v2/style-guide/),提高对组件名，以及组件编写时的部分规范

#### 组件库

建议使用[storybook](https://storybook.js.org/) 或者[bit](https://bit.dev/)管理公共组件库，或者对外使用提供简易的组件接口文档(props，events,  slots)

#### 代码层

- 核心(难理解)逻辑要加注释，对于函数最好提供params return 说明
- .vue的文件个人立即是UI层，部分控制逻辑写在vue文件中，需要抽离。可以在每个组件下新建一个index.js将其写在这里。
- 全局变量挂在window上，可能会修改window的原有属性。
- 代码部分参数的hard code, 需要抽离到config中
- 添加elsint检查代码，可以针对性的关闭某一个文件检查
- 很多if，else可以创建一个map/object 处理
- event bus应用的有点多， 对于非父子组件的通信还有一些处理方式。全局状态量可以放在vuex中，监听变化处理。provide/inject 传递数据在间隔较远的组件间。
- 使用v-for指令结合定义一种list的数据结构，简化template的内容，并通过修改list内的数据实现动态渲染。
- 部分事件注册(listen)，未释放(remove). 会增大内存
- 部分async await 没有使用try catch包裹，导致报错无处理
- medView中代码中很多关于应用的if，else。可以抽象出来，让底层逻辑并不体现上层应用。同样对于一些逻辑，底层不需要知道采用什么方式实现。可以将实现其抽离出来，放在其他位置。这样后续更改其实现方式时，不在底层做更改。
