# summary of cornerstone-core study

## dicom 简介
dicom（Digital Imaging and Communications in Medicine), 医学影像的一组协议。包含了存储、打印、传输等。[具体详细介绍](https://zh.wikipedia.org/wiki/DICOM)。[官网](https://www.dicomstandard.org/)  
dicom file, 存储包含病人、检查、影像信息的文件，通常以dcm为扩展名。[文件格式](http://dicom.nema.org/medical/dicom/current/output/chtml/part10/chapter_7.html), 由meta information 和 data set 构成。
data set 由data elements 构成。每一个data element 都有一个tag（xxxx, xxxx）x为十六进制数，vr数据类型，vl数据长度，数据值。[dicom tags](https://www.dicomlibrary.com/dicom/dicom-tags/)
例如CT扫描生成的图像，其图像信息存储在((7FE0,0010)tag中  

## cornertone-core简介
由javascript编写，[构建web端的医学影像平台中的*显示环节*](https://docs.cornerstonejs.org/)。对于复杂的web端的医学影像可视化项目，底层可以依赖于cornerstone-core做二维图像渲染。  
## 渲染一张dicom格式的图像
### 图像信息
对于一张由CT扫描的图像，要准确的渲染成一张数字图像。需要理既以下相关的 data elements
- Samples per Pixel (0028, 0002), 字面理解每个像素的采样数，灰度图1, RGB图为3
- Photometric Interpretation (0028, 0004) 主要用于jepg压缩的图像，待补充
- Planar Configuration (0028，0006), 只对于samples per pixel 大于1时起作用，主要针对rgb图像，其三个颜色成分的存储排列。0: color by pixel, R1-G1-B1-R2-G2-B2..., 1: color By Plane, R1-R2-R3...-G1-G2...-B1-B2...
- Rows (0028, 0010), 垂直方向上向下采样因子的倍数。简单认为在在图像上一列像素的总数
- Columns (0028, 0011), 类似Rows，方向为水平方向
- Bits Allocated (0028,0100) 给每个采样的像素值分配的存储空间
- Bits Stored (0028,0101) 每个采样的像素值存储时所占的bit数
- High Bit (0028, 0102) 采样像素的最高有效位
- Pixel Representation (0028, 0103), 像素值数据类型0：无符号整型， 1：有符号数
- Pixel Data (7FE0, 0010) 构成图像的像素数据流，从左到右，从上到下。左上角的像素位置记为(1, 1)
- Slice Thickness（0018， 0050), 切片的层厚
- Image Position(Patient) (0020, 0032) 图像左上角第一个像素在病人坐标系下的值
- Image Orientation(Patient) (0020, 0037) 在病人坐标系下，图像的第一行与第一列的方向余弦值。？待图解
- Pixel Spacing (0028, 0030), 相邻两行（两列）像素在病人坐标系的物理距离值

### 图像显示
假定dicom file已经解析完成。所有tag数据以key/value形式作为dicom实列的属性。
```js
const result = parseDicomFile(url);
const dicom = {
  pixels: result.pixelsData
  rows: result.rows
  ...
}
```
#### 渲染dicom图像
- "<"img src="imageURL" />"
- "<"svg />"
- "<"canvas />"  
使用canvas方式显示，既然知道pixel data, 只需将其值映射成屏幕像素值即可。
由于pixel值的范围并不是屏幕像素0-255范围内，需要做相应的映射。modality lut, voi lut
- modality lut, 像素存储值到实际输出值（OD值，CT值等）的映射，output = slope(0028, 1053) * store_value + intercept(0028, 1052)
- voi lut ,映射函数由linear、linear_exact、sigmoid，其具体取值由voi lut function(0028, 1056)决定，缺省值为linear. voi lut 函数的参数是windowCenter(0028, 1050)和window width(0028, 1051).对于linear形式，窗宽窗位决定了一维直线上的一段区域，落在该区域的CT值（假定）将会被线性映射到0-255区间内，在其范围外的将被clamp
- 像素值的映射有一定的顺序，先做modality lut, 在做voi lut
```js
  const {pixels, rows, columns} = dicom;
  const canvas = initCanvas();
  const context = canvas.getContext('2d');
  // draw
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < coloumns; j++)  {
      const value = voiLutFunc(modalityLutFunc(pixels[i * columns + j]))
      context.save();
      context.fillStyle(value)
      context.fillRect(i, j, 1, 1);
      context.restore();
    }
  }
```
太低效
canvasContext2d.putImageData(imageData, dx, dy)
[imageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData) 对象，表示一定举行区域内的像素值。每个像数值由RGBA四分分量，每个分量的数据类型为[Uint8ClampedArray](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)(对于超出0-255区间内的值会被裁剪)。data属性为Uint8ClampedArray数组，像素值在数组中依次排列。  
imageData对象，可以由CanvasRenderingContext2D.createImageData/getImageData创建。  
```js
//...
// 假设图像为灰度图
const imageData = context.createImageData(rows, columns);
const storedPixels = imageData.data;
let index = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < coloumns; j++)  {
      const grayValue = voiLutFunc(modalityLutFunc(pixels[i*columns + j]))
      storedPixels[index++] = grayValue; // r
      storedPixels[index++] = grayValue; // g
      storedPixels[index++] = grayValue; // b
      storedPixels[index++] = grayValue; // a
    }
  }
context.putImageData(imageData, 0, 0);
```
图像上的每个像素都需要做两次lut操作，耗时也低效。对于一维的数据的可视化，可以使用通用的lookuutable的方法，创建一个一维表将CT value映射成pixel value，不同的CT value对应不同的pixel value。其表的索引代表CT value, 该索引下的值为pixel value。 这样在遍历填充像素时，像素值直接从标准获取不需要做计算
```js
// create lookupTable
const {minValue, maxValue} = getMinAndMaxValueOfDicomStoredValue();
// 避免数组内负索引
const offset =  Math.min(0, minValue);
const lookupTable = new UnitClampedArray(maxValue - offset + 1);
for (let storedValue = minValue; i <= maxValue; storedValue++) {
  lookupTable[storedValue - offset] = voiLutFunc(modalityLutFunc(storedValue))
}
// store pixels
const imageData = context.createImageData(rows, columns);
const storedPixels = imageData.data;
let index = 0;
let start = 0;
const pixelsNum = storedPixels.length;
if (minValue < 0) {
  while (index < pixelsNum) {
    const grayValue = lookupTable[pixels[start++] - minValue];
    storedPixels[index++] = grayValue; // r
    storedPixels[index++] = grayValue; // g
    storedPixels[index++] = grayValue; // b
    storedPixels[index++] = grayValue; // a
  }
} else {
  while (index < pixelsNum) {
    const grayValue = lookupTable[pixels[start++]];
    storedPixels[index++] = grayValue; // r
    storedPixels[index++] = grayValue; // g
    storedPixels[index++] = grayValue; // b
    storedPixels[index++] = grayValue; // a
  }
}
...
```
上述列子只是针对 Samples per Pixel为1的图像渲染成灰度图的处理，还有Samples per Pixel为3的图像渲染成RGB图/伪彩图等等。过程相似。
通常在浏览dicom图像时，可以调节窗宽与窗位来查看不同窗值下的灰度图像。在上述渲染流程中，只需修改voiLutFunc函数的参数，再次生成表进行渲染。
```js
// linear voi lut
function voiLutLinearFunc(pixel, windowWidth, windowCenter) {
  windowWidth = Math.max(windwoWidth, 1);
  // 由于使用的Unit8ClampedArray数据类型会自动裁剪不在0-255范围的值
  return ((pixel - windowCenter) / windowWidth + 0.5) * 055;
}
```
执行putImageData后canvas上将会显示大小为rows * columns的图像，由于用户实际看图的视窗并不为canvas的大小。为此可将图像做缩放后放在用户视窗的中心。引入viewport 概念
#### 显示dicom图像
渲染生成的canvas图像可以看成一张普通的图像，将其画在视窗上。[canvasRenderingContext2D.drawImage()](),将一张图像画在canvas图层上。为了合适的显示一张图像
- 创建视窗canvas
- 将图像画到视窗指定的显示区域
```js
// create viewport canvas
const canvas = initCanvas();
const context = canvas.getContext('2d');
context.fillStyle('black');
context.clearRect(0, 0, canvas.width, canvas.height);
// draw dicom image(rendered canvas)
const scale = Math.min(canvas.width / image.width, canvas.height/ image.height, 0.8)
context.drawImage(
  image,
  0, 
  0,
  image.width,
  image.height,
  canvas.widht /2- image.wdth * scale / 2,
  canvas.height /2- image.height * scale / 2,
  image.width * scale,
  image.height * height
)
```
若用户想要对视窗内的图像做简单的交互操作，如平移缩放渲染等变化？
对于平移和缩放可以修改drawImage参数实现，而旋转无法实现。
##### 变化
- 矩阵
在二维坐标系下，对物体的仿射变化都可以通过乘以一个齐次矩阵实现
```js
// 平移矩阵
// T, 平移x, y
/*
  [
    1 0 x
    0 1 y
    0 0 1
  ]
*/

// R旋转，顺时针旋转r
/*
  [
    cosr -sinr 0
    sinr cosr 0
    0     0   1
  ]
*/
// S缩放，缩放量s
/*
  [
    s 0 0
    0 s 0
    0 0 1
  ]
*/
```
矩阵变化的优势，是多次变化可以转变为各个变化矩阵的乘积（物体变化的顺序是其左乘矩阵的顺序），从而减少运算量。
- canvas2d实现
对于视窗，其坐标原点为左上角点，向右为x的正方向。向下为y的正方向。视窗坐标系固定不变，图像显示在视窗中。图像可以看成视窗坐标系中的物体  
交互时，让图像围绕自身的中心平移旋转缩放。存在一个矩阵T，包含了本次交互的所有变化。让T右乘图像，即可改变图像在视窗中的位置
canvasRenderingContext2D.setTransform(T), T为变化矩阵。通过该接口可以改变画布在视窗坐标系下的位置。
图像画在画布上，setTranform(T)的作用相当于T矩阵右乘图像，从而改变图像  
- 变化的合成
在二维坐标系下，对物体右乘矩阵实现变化时。是相对坐标系的原点。而实际需求中需要围绕图像中心做旋转、缩放等变化。为此，可以分步实现，首先将图像
的中心平移至坐标系原点，在做旋转缩放变化，这样图像是基于自身中心在变化。其次在对图像做平移变化，最后对图像做首次平移变化的反变化。  



### cornerstone 显示
#### 数据结构
##### enabledElement
enabledElement 与 一个HTMLElement元素（通常为DIV）绑定。其属性包含了cornerstone中典型的数据结构image, viewport, canvas等。当通过HTMLElement获取enabledElement时，可以获取显示图像的所有信息。  
对外暴露了enable/disenable接口实现绑定/解绑。绑定的过程。
enabledElements.js文件（模块）中，定义了enabledElements数组变量，暴露get，set借口操作enabledElement  
enable一个元素过程
- 生成一个enabledElement,将其添加到enabledElements
- 对外触发一个enabled事件，对HTMLElement绑定resize事件
- 实现一个draw函数绘制图像，内部调用requestAnimationFrame不断重绘
实现借鉴
- 模块化的思想，将生成的enabledElement实例放在另一个模块中（enableElements）管理
- 抛出一个自定义事件
  ```js
  function triggerEvent (el, type, detail = null) {
  let event;

  // This check is needed to polyfill CustomEvent on IE11-
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(type, {
      detail, // 事件携带的数据存储在detail中
      cancelable: true
    });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, detail);
  }
  // dispatch过程时立即的，监听的元素会立即执行
  return el.dispatchEvent(event);
}
  ```
