/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 取得原生数组的原型
const arrayProto = Array.prototype
// 创建一个数组对象,create中传入一个数组原型，使对象具有数组的方法       ====》配合array.html
export const arrayMethods = Object.create(arrayProto)
// 列举出需要重写的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */

/**
 * Define a property.
 * def代码
 * object.defineProperty()方法为直接再一个对象上定义新的属性或改官现有属性  并返回该对象
 * 
 * 
 *export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
 *  Object.defineProperty(obj, key, {
 *    value: val,  // 与属性相关的值
 *    enumerable: !!enumerable,   // 是否可被Object.keys和for...in 访问到  默认false
 *    writable: true,  // 与该属性相关联的值可以用assignment operator改变时默认false
 *    configurable: true  // 该属性描述符的类型是否可以被改变并且该属性是否可以从对应对象中删除  默认false,
 *    get:function() {},
 *    set: function() {}
 *  })
 *}
 */

methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存数组的原生方法 
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 利用数组的原生方法进行操作
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':   // 新创建
      case 'unshift':  // 修改原有的数组
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
