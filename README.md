# vue + ts 打造组件库

[课程所在网站 - 慕课网](https://coding.imooc.com/class/chapter/466.html#Anchor)

## 笔记

1. 提取 props 定义

    当把代码中的 props 的定义抽离出来后，即使定义了 `require:true`，但鼠标在查看 age 的时候，age 却允许 undefined。

    解决方法很简单，就是在定义后面加上 `as const`。

    ```tsx
    const PropsType = {
        msg: String,
        age: {
            type: Number,
            required: true,
        },
    } /* as const */

    export default defineComponent({
        props: PropsType,
        setup(props) {
            return () => <div>{props.age}</div>
        },
    })
    ```

    原因在于，当直接写在 defineComponent 中时，defineComponent 中自动为 props 类型添加了 `Readonly<>`，此时 ts 就可以通过 required 属性判断某个键是否是必选的（[点击查看源码](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/apiDefineComponent.ts#L233)）。 但是当抽离出来后，Readonly 就不会自动添加了，所以需要我们添加 as const 来告诉 ts。

2. vscode 没有对组件的 props 进行类型支持

    在 `App.tsx` 中引入了 `HelloWorld.vue`。`HelloWorld.vue` 文件中的定义了 props 的 age 属性是必选属性。
    但是在 vscode 中却不会自动提示，原因 vscode 不会对 vue 文件中的类型进行推断。简单地说就是 vue 文件中的类型声明无法暴露出去。
    这也就是 `src\shims-vue.d.ts` 文件的功能。不过在编译时，控制台是检查的。

    解决方案就是使用 `HelloWorld.tsx` ，因为 `tsx` 原生支持类型推断。

3. setup 函数只执行一次，但其返回的函数会多次调用。

    setup 函数可以返回一个对象，也可以返回一个函数。在 vue sfc 中 setup 不会专门返回一个函数，我们一般在 tsx 的 setup 中返回一个函数。该函数会多次调用，而 setup 函数本身只会调用一次。

    setup 返回的函数可以认为是一个渲染函数，渲染函数的返回值本质上应该是 `h` 或者 `createVNode` 函数的返回值。但我们一般不会通过 `h` 来创建节点，而是借助一些插件，比如 `@vue/babel-plugin-jsx`，该插件能够让我们像写 jsx 那样直接写 DOM 对象。（注意，对于 vue-cli 需要专门安装 `@vue/babel-plugin-jsx`，但对于 vite 在不需要）

4. 解决控制台 Uncaught Error: Unexpected usage. at EditorSimpleWorker.loadForeignModule 报错。

    当使用 webpack 和 monaco-editor 时，需要搭配 monaco-editor 的 webpack 插件。没有使用该插件时就会提示上方的报错信息。所以解决方案就是使用该插件。

    先安装 `npm i monaco-editor-webpack-plugin -D`，然后在 `vue.config.js` 添加 monaco 的 webpack 插件配置。文件如下：

    ```js
    const { defineConfig } = require('@vue/cli-service')
    const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

    module.exports = defineConfig({
        chainWebpack(config) {
            config.plugin('monaco').use(new MonacoWebpackPlugin())
        },
    })
    ```

5. tsx 对比 vue sfc 的优势

    tsx 中的组件类型能够自动导出，比如 props 中哪些是必选的，类型是什么，这些都可以在编写代码时直接获取提示。
    但 sfc 中，虽然在编写 sfc 时能获得一些代码提示，但是组件的类型依旧无法自动导出，需要单独声明。

6. 检测组件循环引用

    SchemaItems 组件会用到 ObjectField 组件，而 ObjectField 组件又会用到 SchemaItems 组件，如果在两个文件中互相导入，在这小项目中是没问题的，但如果一直这样做，当项目变大时可能会出现奇怪的一些现象（暂时不清楚是什么），到时候将会让你一脸懵。为此，不推荐循环引用。

    为了检测是否循环引用，可以安装 `npm i circular-dependency-plugin -D`。然后在 vue.config.js 中使用该 webpack 插件。如下：

    ```js
    const { defineConfig } = require('@vue/cli-service')
    const CircularDependencyPlugin = require('circular-dependency-plugin')

    module.exports = defineConfig({
        chainWebpack(config) {
            config
                .plugin('circular')
                .use(new CircularDependencyPlugin({ exclude: /node_modules/ }))
        },
    })
    ```

7. 通过 vue 的 provide 和 inject 替代组件循环引用

    props 是用于像子节点传递数据的，但如果想要给子孙传递数据时，则可以使用[依赖注入](https://vuejs.org/guide/components/provide-inject.html)，即使用 provide 和 inject。

    provide 需要提供一个 key, 这个 key 是全局唯一的，这个时候就可以利用 Symbol 来创建一个唯一的值了。需要注意的是 Sombol() 的值是唯一的，但变量名可不是唯一的。但变量名有作用域，所以只要代码符合规范我们就不用担心。而且变量名重名时会报错，但 key 重复时会直接覆盖。这就是 Symbol 的好处了。

    注意，provide 不会自动对传递的数据进行处理，这是为了 inject 获取数据时，该数据依旧是响应式的（reactive 或 ref）。
    不过，因为我们这里传递的是一个组件，而我们的组件基本不会变化，所以可以直接传递，而不需要封装在 reactive 中。

8. provide 源码

    provide 源码在 [packages/runtime-core/src/apiInject.ts](https://github1s.com/vuejs/core/blob/HEAD/packages/runtime-core/src/apiInject.ts#L9-L10) 中。

    源码核心逻辑非常简单，就是将新的数据添加到 provides 中。

    ```ts
    export function provide<T, K = InjectionKey<T> | string | number>(
        key: K,
        value: K extends InjectionKey<infer V> ? V : T
    ) {
        // currentInstance 指的就是当前渲染的组件，也就是当前执行的 setup 的组件

        if (!currentInstance) { // 判断当前是否处于组件的渲染流程当中。setup 执行的过程就是“渲染流程”
            if (__DEV__) { // 如果是开发者模式，则提示 provide 只能被用在 setup 中
                warn(`provide() can only be used inside setup().`)
            }
        } else {
            // 获取当前组件的 provides
            let provides = currentInstance.provides
            // 获取父组件的 provides
            const parentProvides =
                currentInstance.parent && currentInstance.parent.provides
            // 如果当前组件没有添加新的数据（没有调用 provide），则当前组件的 provides 将会等于父组件的 provides
            if (parentProvides === provides) {
                // 克隆出一个新的 provides，是为了不污染父组件的 provides。
                // 因为父组件的 provides 会传递给多个孩子，当前组件只是其中一个孩子。
                provides = currentInstance.provides = Object.create(parentProvides)
            }
            // 添加新的数据
            provides[key as string] = value
        }
    }
    ```

9. [为 provide 内容提供类型定义](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)。

    注意是在声明 key 的时候提供类型定义。

    此外，虽然提供了 provides 的定义，但 inject 的时候值依旧可能为 undefined。因为调用 inject 的时候，不一定执行了 provides。比如 SchemaForm 中调用了 provide，ObjectField 中调用了 inject。一般情况下，只会调用 SchemaForm 组件，此时 inject 获取的内容就不会是 undefined，但不排除某些情况下，用户直接调用了 ObjectField 组件，这个时候 inject 就会是 undefined 了。

    上面这句话其实其实不用写的，因为使用 ts 开始时，会自动提示会有 undefined。这也是 ts 开发带来的好处，让你知道获取 inject 中的内容时需要先判断一下。

## 疑惑

1. 在 `StringField.tsx` 中只是简单地返回了一个 `<input>`，没有使用 `props` 中的 `value` 和 `onChange`，但 `value` 和 `onChange` 的功能还是自动实现了，这是为什么？但在 vue 文件中就不会自动实现。

    ？？

2. 循环循环组件时（类似 v-for），需要提供一个 key 来让 vue 区分不同组件的，那么直接使用 Symbol() 是否有副作用呢？

    之所以会有这个疑惑，是因为以前开发 vue 时被 v-for 的 key 坑过一下，因为当 key 出现重复时会出现一些问题。

    回到该问题，我现在可以先回答一部分。如果是这样使用：`<SchemaItems key={Symbol()} />`，那么是会出现问题的，原因是每次更新 `SchemaItems` 组件时，都会执行一遍 `Symbol()`，这意味着每一次都将所有组件重新渲染，因为他们的 key 都变化了。

    重新渲染不仅仅影响性能，还可能影响用户体验。最直观的例子就是： `SchemaItems` 组件是一个 `input` 元素时，当用户输入一个字符时会触发 onChange 事件，该事件会让 SchemaItems 重新渲染渲染，结果就是用户输入一个字符后，输入框的就失去焦点了。因为输入框是新的输入框。

    所以，不正确地使用 `Symbol()` 肯定会有副作用！

3. vue 循环渲染组件时，提供的 key 是要求全局唯一呢？还是只需要在全局的对应组件中 key 唯一？（单独在某个循环中唯一这肯定是不对的，如果对的话那么直接使用下标就能解决所有问题）

    ？？
