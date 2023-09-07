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

    jsx/tsx 社区的支持比 vue 完善。

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

10. Vue 的 Jest 配置

    Vue 做的配置封装成了一个 preset，也就是 `jest.config.js` 中的 `preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel'` 。

    `@vue/cli-plugin-unit-jest/presets/typescript-and-babel` 这个 preest 的所在路径，具体可以在 [vue-cli 仓库](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest/presets)中找到。（虽然现在 vue-cli 已经不更新了，但不影响我们学习 webpack。）

    配置文件是层层依赖的：`typescript-and-babel/jest-preset.js` 依赖 `typescript/jest-preset.js` 依赖 `default/jest-preset.js`

    - `typescript-and-babel/jest-preset.js` 配置内容如下：

        ```js
        module.exports = deepmerge(
            defaultTsPreset, // 在 typescript/jest-preset.js 的基础上添加配置
            {
                globals: {
                    // 开启 ts-jest 的 babelConfig。含义是：ts 过后，还要增加 babel 的编译。
                    'ts-jest': {
                        babelConfig: true
                    }
                }
            }
        )
        ```

    - `typescript/jest-preset.js` 配置如下：

        ```js
        module.exports = deepmerge(
            defaultPreset,  // 在 default/jest-preset.js 基础上添加配置
            {
                moduleFileExtensions: ["ts", "tsx"], // 添加了 ts 和 tsx 文件

                transform: { // 配置转换规则
                    "^.+\\.tsx?$": tsJest, // 将 tsx 后缀名文件交给 tsJest 处理。 require.resolve('ts-jest')
                },
            }
        );
        ```

    - `default/jest-preset.js` 配置中的一些介绍已经移到笔记仓库中了，这里只记录一些有关该项目的

        ```js
        snapshotSerializers: [ // 通过 jest-serializer-vue 来对快照进行序列化。比如将组件的渲染结果序列化成一个字符串，后面每次测试时，都要去渲染的序列化结果保持不变。
            'jest-serializer-vue'
        ],
        testMatch: [  // 当直接运行 jest 时，会根据该配置项去寻找对应的测试文件所在
            '**/tests/unit/**/*.spec.[jt]s?(x)',
            '**/__tests__/*.[jt]s?(x)'
        ],
        testURL: 'http://localhost/', // 有些测试会模拟一个服务端请求，这个就是配置对应的 URL 的
        watchPlugins: [ // 热更新 watch 时使用的插件
            require.resolve('jest-watch-typeahead/filename'),
            require.resolve('jest-watch-typeahead/testname')
        ]
        ```

11. 老师解决问题的思路

    测试组件时，发现组件的挂载报错，报错内容是 props 上的某个值不存在。但实际打开网页时确实存在的。所以 vue 语法本身没有错误。那就得查看测试所使用的模块是否版本对不上。由于当时的 vue3 才正式发布两天，vue 文件中使用的又是最新的 setup 语法，而且还是 beta 阶段。查看对应的 vue-jest ，发现版本还不支持 setup 新语法。

    老师解决的第一个错误类型我目前可能很难遇到，但第二个错误就很值得学习了：将导入模块的后缀名 `.vue` 去掉后，本来期待它会去找 `tsx` 文件，但结果还是出现同样的报错信息，于是怀疑模块引入的还是 vue 文件（我的话应该会先尝试删掉 vue 文件）。根据经验想到可能是 jest.config.js 的配置文件，于是修改 jest.config.js 的配置，根据 vue-cli 的配置型，然后创建出自己的新的配置项 `moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue']`，最终成功解决问题！

    从老师解决问题的方法来看，当开发的项目涉及很多依赖时，对这些依赖的模块有一个总体的认识很重要！这就是为什么要学习 webpack、babel 等工具的基本原理。不知道原理，当出现错误时很难找出答案。

12. 打包

    使用 vue-cli build 打包时，通过指定 `--target lib` 可以构成“库”，不指定时默认是构建“应用”（`--target app`）

    当构建库时，vue 被认为是外置的，所以不会打包进去。构件库时需要在命令行最后提供一个入口文件，如果没有提供，默认是 `src/App.vue`。

    在打包的过程中，会执行对应的配置，比如 vue.config.js 中用到的依赖也会打包进去。由于我们构建 demo 页面时，使用到了 `MonacoWebpackPlugin` 插件，但实际的库文件是中没有该插件的。我们可以通过一个环境变量来识别当前是什么环境，从而来决定是否配置该插件。

    在命令行前面添加 `set TYPE=demo` 可以设置一个环境变量 `TYPE`，然后在 vue.config.js 中通过 `process.env.TYPE` 获取到该环境变量。通过判断环境变量的值，来决定是否 `config.plugin('monaco').use(new MonacoWebpackPlugin())`。注意环境变量后面的空格，最好就是在获取环境变量时清除两端空格。

    vue-cli build 还有其他参数：

    - `--no-clean` 在构建项目之前不清除目标目录的内容。安装 `rimraf` 模块实现递归删除文件夹。
    - `--name <name>` 指定生成的文件名称，不需要包含后缀名。默认值是 package.json 中的 name
    - `--dest <dest>` 指定输出目录 (默认值：dist)

## 疑惑

1. 在 `StringField.tsx` 中只是简单地返回了一个 `<input>`，没有使用 `props` 中的 `value` 和 `onChange`，但 `value` 和 `onChange` 的功能还是自动实现了，这是为什么？但在 vue 文件中就不会自动实现。

    新发现，如果没有提供 props 的声明，props 中的 value 和 onChange 似乎会自动 写成下面这样时，value 和 onChange 似乎自动变成了 input 上的属性。

    ```tsx
    // import { FieldPropsDefine } from '../types'
    import { defineComponent } from 'vue'

    export default defineComponent({
        name: 'StringField',
        // props: FieldPropsDefine,
        setup() {
            return () => {
                return <input type="text" placeholder="占位符" />
            }
        },
    })
    ```

    但如果提供了 props 的声明（也就是取消注释的内容），问题就消失了！

    这是为什么？？

2. 循环循环组件时（类似 v-for），需要提供一个 key 来让 vue 区分不同组件的，那么直接使用 Symbol() 是否有副作用呢？

    之所以会有这个疑惑，是因为以前开发 vue 时被 v-for 的 key 坑过一下，因为当 key 出现重复时会出现一些问题。

    回到该问题，我现在可以先回答一部分。如果是这样使用：`<SchemaItems key={Symbol()} />`，那么是会出现问题的，原因是每次更新 `SchemaItems` 组件时，都会执行一遍 `Symbol()`，这意味着每一次都将所有组件重新渲染，因为他们的 key 都变化了。

    重新渲染不仅仅影响性能，还可能影响用户体验。最直观的例子就是： `SchemaItems` 组件是一个 `input` 元素时，当用户输入一个字符时会触发 onChange 事件，该事件会让 SchemaItems 重新渲染渲染，结果就是用户输入一个字符后，输入框的就失去焦点了。因为输入框是新的输入框。

    所以，不正确地使用 `Symbol()` 肯定会有副作用！

3. vue 循环渲染组件时，提供的 key 是要求全局唯一呢？还是只需要在全局的对应组件中 key 唯一？（单独在某个循环中唯一这肯定是不对的，如果对的话那么直接使用下标就能解决所有问题）

    ？？
