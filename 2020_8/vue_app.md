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