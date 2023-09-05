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

6. 检测组件循环依赖

    SchemaItems 组件会用到 ObjectField 组件，而 ObjectField 组件又会用到 SchemaItems 组件，如果在两个文件中互相导入，在这小项目中是没问题的，但如果一直这样做，当项目变大时可能会出现奇怪的一些现象（暂时不清楚是什么），到时候将会让你一脸懵。为此，不推荐循环依赖。

    为了检测是否循环依赖，可以安装 `npm i circular-dependency-plugin -D`。然后在 vue.config.js 中使用该 webpack 插件。如下：

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

## 疑惑

1. 在 `StringField.tsx` 中只是简单地返回了一个 `<input>`，没有使用 `props` 中的 `value` 和 `onChange`，但 `value` 和 `onChange` 的功能还是自动实现了，这是为什么？但在 vue 文件中就不会自动实现。
