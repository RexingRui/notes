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
- Photometric Interpretation (0028, 0004)主要用于jepg压缩的图像，待补充
- Planar Configuration (0028，0006), 只对于samples per pixel 大于1时起作用，主要针对rgb图像，其三个颜色成分的存储排列。0: color by pixel, R1-G1-B1-R2-G2-B2..., 1: color By Plane, R1-R2-R3...-G1-G2...-B1-B2...

