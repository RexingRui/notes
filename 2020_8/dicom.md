### 创建一个lookupTable
- 计算最大和最小“像素”， min， max
- 根据窗值，求出voi： pixel => ((pixel - WINDOWCENTER) / WINDOWWIDTH + 0.5) * 255
- 创建lookupTable为Uint8ClampedArray类型数据，长度为max - min
- 从最小”像素“min，step为1，遍历至max， lookupTable[j] = voi(min + j);

### cornerstone 使用webgl渲染dicom图像
#### 使用
在enable element时，传入options = {renderer: 'webgl'}
#### 初始化
- 使用webgl1， VBO 绑定vertexPositionBuffer,textureCoordsBuffer, 二者对应
- shader作为全局变量，绑定attributes, uniforms, program
- 不同的像素数据类型，使用不同的fragmentShader, 生成不同的纹理
#### 渲染
- 获取全局变量shader，设置状态量
- vertexShader中使用clip space
- 
