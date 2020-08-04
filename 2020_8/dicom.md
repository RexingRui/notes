### 创建一个lookupTable
- 计算最大和最小“像素”， min， max
- 根据窗值，求出voi： pixel => ((pixel - WINDOWCENTER) / WINDOWWIDTH + 0.5) * 255
- 创建lookupTable为Uint8ClampedArray类型数据，长度为max - min
- 从最小”像素“min，step为1，遍历至max， lookupTable[j] = voi(min + j);
