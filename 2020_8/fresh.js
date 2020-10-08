/**
 * 闭包
 * Object.prototype.toString
 * target作为参数，使用call以函数的形式调用
 * 返回target的类型
 */
function isType(type) {
  return function (target) {
    return `[object ${type}]` === Object.prototype.toString.call(target)
  }
}

/**
 * 稀疏数组的处理
 * 
 */
function selfMap(fn, context) {
  let arr = Array.prototype.slice.call(this);

  let mappedArr = Array();

  for (let i = 0; i < arr.length; i++) {
    if (!arr.hasOwnProperty(i)) continue;
    mappedArr[i] = fn.call(context, arr[i], i, this);
  }
  return mappedArr;
}
/**
 * reduce的使用
 */
function selfMap2(fn, context) {
  const arr = Array.prototype.slice.call(this);
  return arr.reduce((pre, cur, index) => [...pre, fn.call(context, cur, index, this)], [])
}

function selfReduce(fn, initial) {
  const arr = Array.prototype.slice.call(this);
  const res = initial ? initial : getFirstValueOfArr(arr);
  for (let i = ++res.index || res; i < arr.length; i++) {
    res = fn.call(null, res, arr[i], i, this)
  }
}

function getFirstValueOfArr(arr) {
  for (let i = 0, len = arr.length; i< len; i++) {
    if (arr.hasOwnProperty(i)) {
      return {index: i, value: arr[i]};
    }
  }
}

function selfFlat (depth = 1) {
  const arr = Array.prototype.slice.call(this);
  let flatArr = [];
  (function flat(arr, depth) {
    for (let i = 0, len = arr.length; i < len;i++) {
      if (!arr.hasOwnProperty[i]) continue;
      const value = arr[i];
      if (Array.isArray(value) && depth > 0) {
        flat( value, depth - 1);
      } else {
        flatArr.push(value);
      }
    }
  })(arr, depth)
 

  return flatArr;

}

/**
 * class实现
 * Object.create
 * Object.setPrototypeOf
 */
function inherit(subType, superType) {
  subType.prototype = Object.create(superType.prototype, {
    constructor: {
      enumerable: false,
      configurable: true,
      writable: false,
      value: subType
    }
  });

  Object.setPrototypeOf(subType, superType)
}
