### swagger editor使用

- 安装

Swagger editor 为 web 端应用，在github上直接下载源代码，使用静态版本

- 基本使用， 主要是编写yaml文件
  - 缩进来分层
  - '-' 表示数组
  - schema定义一个json对象
  - array数据，要配置其items
  - 可以通过 $ref来获取定义好的数据结构
  - in字段
    - path 在url中要体现 ， store/{userID},
    - query 查询字段
    - body 请求体中的数据
  - consumes定义传入参数类型， produces定义返回参数类型

### 组件自定义事件传参数
- emit只能抛出一个参数，多个参数则需要写成对象结构
- 在监听处理如果需要额外传入其他参数, 需要写成这种形式 @onTest=handleTest(args, event), @event 是组件传给父组件的参数 ？， @onTest=handleTest(args)会被解析成 function(event) {handleTest(args, event)}, 所以handleTest可以访问到event参数
