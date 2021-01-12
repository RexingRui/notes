#### about bind/rebind buffer in webgl
GL/WebGL has a bunch of internal state. All the functions you call set up the state. When it's all setup you call drawArrays or drawElements and all of that state is used to draw things
This has been explained elsewhere on SO but binding a buffer is just setting 1 of 2 global variables inside WebGL. After that you refer to the buffer by its bind point.

使用VAO（vertexArray），它包含了所有的属性绑定点。可以在初始化时设置所有属性和缓冲区，然后在绘制时只需1个WebGL调用即可设置所有缓冲区和属性。

