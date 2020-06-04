/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// 订阅者
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    // 存放观察者
    this.subs = []
  }
  // 添加一个观察者对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
// 移除一个观察者对象
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  /*依赖收集，当存在Dep.target的时候添加观察者对象*/
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  // 当数据变化时 对所有订阅者进行通知
  notify () {
    // stabilize the subscriber list first  浅拷贝
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 遍历进行更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// 依赖收集完毕，将依赖赋值为空，防止重复添加
Dep.target = null
const targetStack = []
/*将watcher观察者实例设置给Dep.target，用以依赖收集。同时将该实例存入target栈中*/
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
/*将观察者实例从target栈中取出并设置给Dep.target*/
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
