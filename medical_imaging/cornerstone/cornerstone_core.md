# summary of cornerstone-core study

## dicom 简介
dicom（Digital Imaging and Communications in Medicine), 医学影像的一组协议。包含了存储、打印、传输等。[具体详细介绍](https://zh.wikipedia.org/wiki/DICOM)。[官网](https://www.dicomstandard.org/)  
dicom file, 存储包含病人、检查、影像信息的文件，通常以dcm为扩展名。[文件格式](http://dicom.nema.org/medical/dicom/current/output/chtml/part10/chapter_7.html)
dicom file中由data elements 构成。每一个data element 都有一个tag（xxxx, xxxx）x为十六进制数，vr数据类型，vl数据长度，数据值。[dicom tags](https://www.dicomlibrary.com/dicom/dicom-tags/)
例如CT扫描生成的图像，其CT值在tag为(7FE0,0010)的element中。

## cornertone-core简介
由javascript编写，[构建web端的医学影像平台中的*显示环节*](https://docs.cornerstonejs.org/)。对于复杂的web端的医学影像可视化项目，底层可以依赖于cornerstone-core做二维图像渲染。  
## 渲染一张dicom格式的图像
### 图像信息
对于一张由CT扫描的图像，要准确的渲染成一张数字图像。需要理既以下相关的 data elements
- Samples per Pixel (0028, 0002), 字面理解每个像素的采样数，灰度图1, RGB图为3
- Photometric Interpretation (0028, 0004) 颜色空间
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
  return ((pixel - windowCenter) / windowWidth + 0.5) * 255;
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

  ##### 实现借鉴

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

##### image
image对象是针对dicom图像的具体描述，每个image对象都有一个imageId。根据dicom文件中的dicom element解析为minPixelValue/maxPixelValue/slope/windowCenter/rows等属性，也提供获取像素值getPixelData，获取图像getCanvas等接口
image为需要显示的图像，image作为enabledElement的属性。如果其不存在，则无法渲染。
cornerstone本身并没有提供接口用于生成image对象，而是将创建流程交给了使用者。

##### imageLoader (Function)
cornerstone提供了loadImage/loadImageAndCache接口用于载入image。接受一个参数imageId（String）,返回一个对象{promise, error}promise为Promise， resolve(image)，error表示载入失败
imageId的结构（pluginName + ':' + any）定义了一种imageLoader，imageLoader作为插件的形式由用户编写，通过registerImageLoader(pluginName, imageLoader)进行注册使用。
```js
// image loader  
const myImageLoader = (imageId) => {
    let error = null
    const imagePromise = new Promise(async (resolve, reject) => {
      try {
        const dicomData = await fetch(imageId.replace("mayLoader:", ""));
        const image = createImage(imageId, dicomData);
        resolve(image)
      } catch(err) {
        error = err;
      }
    });
    
    return {
    	promise: imagePromise,
      error
    }
  }
// register
cornerstone.registerImageLoader('mayLoader', myImageLoader);
// create image
// imageId should have imageLoader name
function createImage(imageId, dicomData) {
  const {rows, columns,slope, intercept, windowCenter, windowWidth} = dicomData;
  const {minPixelValue, maxPixelValue} = findMinAndMaxPixel(dicomData.pixels)
	return {
    imageId,
   	getPixelData: () => dicomData.pixels,
    getCanvas: () => null, // apply in RGB image
    minPixelValue ,
    maxPixelValue ,
    slope: 1.0,
    intercept ,
    windowCenter ,
    windowWidth ,
    render: cornerstone.renderGrayscaleImage,
    getPixelData: getPixelData,
    rows,
    columns,
    color: false, // is RGB image
    columnPixelSpacing: 0.67578,
    rowPixelSpacing: 0.67578,
    sizeInBytes: width * height * 2,
  }
}
```

[CornerstoneWODOImageLoader](https://github.com/cornerstonejs/cornerstoneWADOImageLoader)基于dicom协议中的WODO编写的imageloader。

imageLoader的意义

- 插件的形式编写，可实现多种不同获取image的形式
- 返回结果的异步，满足web端对资源获取的异步性
- 提供了缓存的功能，可定制的缓存加载过的图像

##### 实现借鉴

imageLoader.js模块，内部定义了imageLoaderObject对象，其key为imageLoader的name, value为imageLoader。  

通过注册过后的imageLoader都保存在imageLoaderObject中，在调用loadImage接口时通过imageId中包含的imageLoader name可以从imageLoaderObject中找到相对应的imageLoader。从而支持多种方式/图像的加载。

 imageCache.js模块，内部定义了imageCacheDict对象和cachedImages数组，它们都存cacheImage这种数据结构

- loaded [Boolean]
- imageId 
- imageLoadObject : imageLoader返回的对象{promise, error}
- timeStamp
- sizeInBytes
- image

imageCacheDict以imageId为key，value为cacheImage, cacheImages存了cacheImage。

通过imageLoaderObject由于其返回Promise, 因此可以被多处使用，并且该Promise的fullied状态的*[[PromiseResult]]保存了image对象。

缓存实现：在loadImage/loadImageAndCache时，第一步根据imageId从cacheImages中找到cahcheImage对象，返回cacheImage的imageLoadObject属性。通过调用其promise找到之前reslove过的image对象

```js
// imageLoadObject 多处使用
// 首次载入图像， 内部调用promise,抛出一个载入完成事件
 imageLoadObject.promise.then(function (image) {
    triggerEvent(events, EVENTS.IMAGE_LOADED, { image });
  }, function (error) {
    const errorObject = {
      imageId,
      error
    };

    triggerEvent(events, EVENTS.IMAGE_LOAD_FAILED, errorObject);
  });
// 作为loadImage/loadImageAndCache的返回值
return imageLoadObject
// 图像载入后，缓存的处理
imageLoadObject.promise.then(function (image) {
    cachedImage.image = image;
    cachedImage.sizeInBytes = image.sizeInBytes;
    cacheSizeInBytes += cachedImage.sizeInBytes;
    const eventDetails = {
      action: 'addImage',
      image: cachedImage
    };

    triggerEvent(events, EVENTS.IMAGE_CACHE_CHANGED, eventDetails);
})
```
##### viewport

视窗作为图像的载体，决定了如何显示一张dicom图像。以及对图像的缩放、翻转、平移，窗宽窗位的操作等

viewport对象含有scale, voi, displayArea等属性，根据viewport，计算视窗canvas的transform。canvasRendering2dContext.setTransform(transform)更改canvas坐标系（相当于作用图像）。前面已经介绍了仿射变换以及窗值变化的原理实现。

##### 坐标系转化

- 视窗坐标系， 左上角为坐标系的原点，向右为x的正方向，向下为y的正方向
- 图像坐标系，dicom图像的像素以row-order方式存储在数组中，比如，将数组内的数据按个填充在一个矩形网格中。从左到右，从上到下。网格的左上角坐标系的原点，向右向下为正。

一个坐标系(二维)，可以用原点(**p**)和一组基表示(**u**, **v**), 在坐标系中的任意一点坐标值（u, v）可描述为

**q** +u**u** + v**v** ，假设存在一个全局的坐标系原点**o** ，基为**x**, **y**。设视窗坐标系为全局坐标系，图像坐标系为原点(**q**)和基为(**u**, **v**)的坐标系。**q**,**u**, **v**的值都是相对全局坐标系的。存在一点p在视窗坐标系下的值为(x,y),在图像坐标系下的值为(i, j)。坐标值描述的点只是基于该坐标系原点和基的简写。

![截屏2020-11-11 下午8.05.14](https://tva1.sinaimg.cn/large/0081Kckwgy1gklhlwlrwbj30y604wgm6.jpg)

![截屏2020-11-11 下午8.05.36](https://tva1.sinaimg.cn/large/0081Kckwgy1gklhml61txj30cm03kmx8.jpg)

至此，推导出了从一个坐标系到另一个坐标系的变化矩阵T

对于图像坐标系和视窗坐标系之间的转换，可以这样理解。最初的时候二者是重合的，变化矩阵T为单位阵，当执行setTransform(transform)操作后。改变了图像坐标系，此时T为transform，表示图像坐标系到视窗坐标系的变化。对于(i, j, 1)左乘transform可以得到(x,  y, 1).同样(x, y,1)左乘invert(trannsform)可以得到(i, j, 1)

##### 实践借鉴

- 封装了Tranform类，用于二维坐标下的矩阵运算
- 定义了一个显示区域，将dicom图像画在视窗的显示区域上

Transform内部用一个长度为6的数组m描述了变化矩阵T，因为T的最后一列为（0， 0， 1）所以可以简化处理。数组m为数据存储为行阶矩阵。gl为列阶矩阵。

viewport定义了一个显示区域displayArea{brhc: {x, y}, tlhc: {x, y}},通常来说左上角tlhc位置(1,  1)。右下角位置为图像的行数、列数。在生成一张dicom图像以及设定完canvas的Transform后。画布上下文将图像画在画布上

```js
const sx = enabledElement.viewport.displayedArea.tlhc.x - 1;
const sy = enabledElement.viewport.displayedArea.tlhc.y - 1;
const width = enabledElement.viewport.displayedArea.brhc.x - sx;
const height = enabledElement.viewport.displayedArea.brhc.y - sy;
// 保证了初始时，图像和视窗重合。
context.drawImage(renderCanvas, sx, sy, width, height, 0, 0, width, height);
```

对于mpr的图像，由于行列方向上的spacing可能不同。存在另种显示模式presentationSizeMode（viewport的属性）缺省的‘’NONE“，“SCALE TO FIT”。

- NONE 会根据spacing的比值调整缩放值viewport.scale
- SCALE TO FIT, 适应当前窗口计算缩放值

##### events

ornerstone所有的事件为自定义事件，事件名称全部定义在events模块中。内部实现中triggerEvent函数新建自定义事件，然后dispatchEvent抛出事件。函数的第一个参数为事件触发/接受对象。对于dom元素，它们都有addEventListener/dispatchEvent接口。但triggerEvent并不是只针对dom节点元素。因此在event模块中封装了一个EventTarget类，它是对DOM EventTaget接口的一种实现。让EventTarget的实例拥有和DOM元素一样的事件监听/触发机制。  关于dipatchEvent

- dipatchEvent与原生dom事件不同，dispatch事件后会立即执行，而不是异步的执行。事件handler中不能抛错，否则影响整个程序的执行。
- dispatchEvent事件后，如果任意一个事件监听者的回调中执行了Event.preventDefault，则返回false，否则为true；conerstone的事件handler中并没有按照这样的规则实现。



##### alph 通道快速渲染灰度图

[imageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData/ImageData)的data属性是指图像的像素。每个像素由四个8位无符号整型数(0-255)构成,分别代表r,g,b,a。对于CT，很多情况下展现的是灰度图。将dicom图像存储的像素值，通过modalityLUT, voiLUT操作后映射成0-255区间的灰度值。在填充像素时，将像素值的r,g,b都设为该灰度值，a通道身为255。这样完成了灰度图的渲染。

如果，将图像在初始化时全部填充白色像素值(255, 255, 255, 255).然后在渲染填充像素时，只将a通道值设为灰度值。那么也能完成CT灰度图的渲染。因为在0-255区间内CT值大，图像越白。通过a通道的值控制灰度图的黑白，从而达到一样的显示效果，但在遍历填充像素时的操作减少，使整个渲染性能提升。

##### composite layers

有时需要将多张图像同时画在一个画布上，如pet ct图像。enabledElement对象定义了layers[Array]属性, 数组内部元素为layer对象，layer可以认为是简化版的enabledELement, 它同样含有自己的image，viewport。同时其options属性定义了其特有的属性，如visible, opacity等。layers模块实现了layer的相关接口，addLayer, removeLayer, getLayer。

在调用addLayer时函数返回一个layerId, layerId为layer对象的属性。通过layerId作为get/remove/setImage/activeLayer等函数的必要参数。多层layers中有一层作为active(base) layer, 该layer的imge，viewport为它们所绑定enabledElement对象的image，viewport。并将layerId设为enabledElement.activeLayerId;

```js
  enabledElement.activeLayerId = layerId;
  enabledElement.image = layer.image;
  enabledElement.viewport = layer.viewport;
```

渲染过程

- 每一帧渲染时，若enabledElement 元素存在layers属性，则调用drawCompositeImage
- viewport同步处理，所谓同步，是让其他非activeLayer跟随activeLayer的viewport变化而变化。
  - enabledElement.syncViewports属性表示是否所有layers同步渲染。 enabledElement.lastSyncViewportsState记录上次同步的状态，可以减少同步运算
  - 每个layer定义syncProps属性，里面存放上一次渲染改layer的scale值。通过对比这次渲染的scale，求出变化量，从而更新同步
- 遍历所有可见的layers（visible不为false， opacity不为0），根据其viewport和对应的render（gray/color...）生成画布，将其画在enabledElement.canvas上。

##### webgl

cornstone支持webgl渲染dicom图像来提高性能。

cornestone.enable()元素，若options中含有renderer字段，且其值为webgl，则表示使用webgl渲染。

- 检查是否浏览器支持webgl环境
- 初始化webgl中使用的shader和buffer（只初始化一次）
  - shader， 针对每种pixel的数据类型，创建一个fragment shader。webgl使用的webgl1, 对数据类型的并不支持float类型。若pixel的Int16类型， 需要将其值存在三个uint8类型的数中。使用gl.RGB作为纹理参数的format。fragmentShader中，读取纹理值后(unit8)转化成int16类型，在进行modalitylut 和voilut，计算出灰度值. 在vertexShader需要根据图像的宽高比，将顶点坐标转化成NDC坐标值
  - buffer， ，只需要在vertexShader定义四个顶点（正方形），。纹理坐标值通过插值在fragmentShader中使用。
- dicom图像的主要tag值通过uniform变量传到fragmentShader中，在shader中做lut处理
- 每一帧渲染时，通过webgl渲染一张原始大小的dicom图像，再画到画布上。

