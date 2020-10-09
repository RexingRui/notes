### render
#### 关于opengl目录下
- render, actor, mapper, 都是openglRenderWindow根据需要自动生成的,没有显示的引用
- openglRenderWindow只是作为renderWindow的view, 负责渲染，渲染时按照需要创建gl下的render, actor...
- mapper类和renderWindow类都继承了*viewNode类*与render相关
