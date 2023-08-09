import { Pinia, PiniaPlugin, setActivePinia, piniaSymbol } from './rootStore'
import { ref, App, markRaw, effectScope, isVue2, Ref } from 'vue-demi'
import { registerPiniaDevtools, devtoolsPlugin } from './devtools'
import { USE_DEVTOOLS } from './env'
import { StateTree, StoreGeneric } from './types'

/**
 * Creates a Pinia instance to be used by the application
 */
export function createPinia(): Pinia {
  const scope = effectScope(true)
  // NOTE: here we could check the window object for a state and directly set it
  // if there is anything like it with Vue 3 SSR
  const state = scope.run<Ref<Record<string, StateTree>>>(() =>
    ref<Record<string, StateTree>>({})
  )!

  let _p: Pinia['_p'] = []  // 存储插件的数组
  // plugins added before calling app.use(pinia)
  let toBeInstalled: PiniaPlugin[] = [] // 存储在调用 app.use(pinia) 之前添加的插件
  // 创建 Pinia 实例
  const pinia: Pinia = markRaw({
    // 安装方法，将 pinia 注入到应用中
    install(app: App) {
      // 设置 pinia 为活动状态，允许在组件外部调用 useStore()
      setActivePinia(pinia)
      // 如果是Vue全局注册已经在PiniaVuePlugin完成，不需要执行以下逻辑
      if (!isVue2) {
        pinia._a = app // 保存app
        app.provide(piniaSymbol, pinia) // provide传递Pinia实例
        app.config.globalProperties.$pinia = pinia // 设置全局属性$pinia
        /* istanbul ignore else */
        if (USE_DEVTOOLS) {
          registerPiniaDevtools(app, pinia)
        }
        // 将之前添加的插件添加到 _p 数组中，并清空 toBeInstalled 数组
        toBeInstalled.forEach((plugin) => _p.push(plugin))
        toBeInstalled = []
      }
    },

    // 添加插件的方法
    use(plugin) {
      if (!this._a && !isVue2) {
        // 如果没有安装 app.use(pinia) 则存储到 toBeInstalled 数组
        toBeInstalled.push(plugin)
      } else {
        // 否则存储到 _p 数组
        _p.push(plugin)
      }
      return this
    },

    _p,  // 已添加的插件数组
    // it's actually undefined here
    // @ts-expect-error
    _a: null, // 将在 install 方法中设置
    _e: scope, // 作用域对象，每隔store都是独立作用域
    _s: new Map<string, StoreGeneric>(), // 存储 Store 对象的 Map
    state, // 所有state的合集 key为pinia的id value为store下的所有state（所有可访问变量）
  })

  // pinia devtools rely on dev only features so they cannot be forced unless
  // the dev build of Vue is used. Avoid old browsers like IE11.
  if (USE_DEVTOOLS && typeof Proxy !== 'undefined') {
    pinia.use(devtoolsPlugin)
  }

  return pinia
}
