### chapter 3

- 严格模式可以单独在函数体内设置

- 养成每行编程语句加分号的习惯

- var 与 let/const 的对比

  - 在使用var 声明变量时，有状态提升的现象,但对于let会产生“temporal dead zone” 
  - var is function scoped, let/const is block scoped
  - var声明的变量会作为全局对象的window的属性，而let不行
  - for循环中迭代变量的作用域在循环体内，每一个循环体内重新声明一个新的迭代变量

- 六种基本类型数据，和一种object类型数据，使用typeof操作时，对null返回object,对函数返回function

- 对于未声明的变量和未初始化值的变量，其typeof操作都返回undefined

- Boolean()类型转换

  ![截屏2020-10-08 下午9.36.53](https://tva1.sinaimg.cn/large/007S8ZIlly1gji96z2mogj319e0ec0uz.jpg)

- 数字类型转化， Number()可转任意类型数据， parseInt(value, radix)， parseFloat(value)
- 无穷的表示Infinity, isFinite()函数可判断，isNaN()判断任意类型的数据是否是数Some nonnumerical values convert into numbers directly, such as the string "10" or a Boolean value
