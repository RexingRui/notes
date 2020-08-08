### 坐标
#### 在shader中的坐标表示
- 纹理坐标范围[0, 1], 对应与屏幕左下角为(0, 0)， 右上角为（1， 1）
- 定点坐标，二维情况下，无MVP变化。画布中心点为(0, 0), 坐标范围在[-1, 1]

#### 利用叉乘的概念来计算已知点到已知线段的最短距离
- 两个向量叉乘的模表示两个向量所围成四边形的面积，若将b假定为底边，长度为1，那么可以得到P点到AB的垂直距离
    $ S = AP * AB * sin\theta $
- 如果点P的在AB上的投影不再AB内，则最短距离为到AB两个端点的距离

```js
/**
 * 二维平面
 * @param {object} point {x, y} 
 * @param {array} line [point, point] 
 */
function pointToSegmentDistance(point, line) {
  const [end1, end2] = line;
  const vectorL = [end2.x - end1.x, end2.y - end1.y];
  const lineLength = Math.hypot(...vectorL);
  const  pProjectOnLine = (point.x - end1.x) * vectorL[0] + (point.y - end1.y) * vectorL[1] ;
  const vectorNormalized = vectorL.map(i => i / lineLength);
  // 对于二维平面，叉乘结果的模可简化写成：
  const pCrossLine = Math.abs((point.x - end1.x) *  vectorNormalized[1] - (point.y - end1.y) * vectorNormalized[0])
  if (pProjectOnLine >= 0 && pProjectOnLine <= lineLength) return pCrossLine;
  return Math.min(Math.hypot(point.x - end1.x, point.y - end1.y), Math.hypot(point.x - end2.x, point.y - end2.y))
}
```

#### 判断一点是否在三角形内

![截屏2020-08-08 下午7.13.02](/Users/rexrui/Library/Application Support/typora-user-images/截屏2020-08-08 下午7.13.02.png)

![截屏2020-08-08 下午7.14.57](https://tva1.sinaimg.cn/large/007S8ZIlgy1ghjm9qr5eoj30gu02k0st.jpg)

三个顺时针同向则在三角形内

