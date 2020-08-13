### glsl 的高亮与加载
- webpack使用raw-loader加载glsl程序， test: '/\.vert|frag$/'
- 使用WebGL GLSL Editor ， WebGl Syntax Hint, 补全/函数提示/高亮显示

### 分层架构

- 前端 MVC ， MVVM
- 应用 db， cache, service, front

数据在每一层中流动， 屏蔽与复用

View -> 显示分组的诊断信息， 只有后分组诊断信息即显示，调用数据时不知道数据获取的细节

Model -> 存放诊断信息， 提高获取诊断信息的借口， 唯一数据源

C/VM -> 生成诊断分组形势的诊断信息 ， 由Model-get-Handle-push-View

