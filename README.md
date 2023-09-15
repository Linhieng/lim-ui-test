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

        if (!currentInstance) {
            // 判断当前是否处于组件的渲染流程当中。setup 执行的过程就是“渲染流程”
            if (__DEV__) {
                // 如果是开发者模式，则提示 provide 只能被用在 setup 中
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
                provides = currentInstance.provides =
                    Object.create(parentProvides)
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
                        babelConfig: true,
                    },
                },
            }
        )
        ```

    - `typescript/jest-preset.js` 配置如下：

        ```js
        module.exports = deepmerge(
            defaultPreset, // 在 default/jest-preset.js 基础上添加配置
            {
                moduleFileExtensions: ['ts', 'tsx'], // 添加了 ts 和 tsx 文件

                transform: {
                    // 配置转换规则
                    '^.+\\.tsx?$': tsJest, // 将 tsx 后缀名文件交给 tsJest 处理。 require.resolve('ts-jest')
                },
            }
        )
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

13. 曾经的 vue 的 `DefineComponent` 声明组件类型

    现在可以直接通过 `type CommonWidgetDefine = DefineComponent<typeof CommonWidgetPropsDefine>` 这样子来声明组件类型。但在之前，需要这样子 `DefineComponent<typeof CommonWidgetPropsDefine, {}, {}>` 才可以。

    但在以前是不可以的，vue 刚出现时，如果这样使用的话，会发现组件的 props 是 any 类型，原因在于它的类型非常复杂，既包含了 vue2 也包含了 vue3，所以导致只提供第一个 props 类型，后面的值为 undefined 时，会自动重载到 props 是 any 的那个类型上。解决方法就是提供多几个值，让它能够重载到我们想要的类型上。

    但现在又出现了新的问题，具体见下面。

14. props 的 onChange 重名时会是一个数组

    考虑下面这种场景，StringField 是 TextWidget 的父组件的，传递的 props 有 value（表单值）和 onChange（更改 value）值。
    当有时 StringField 会想要处理子组件的 onChange，于是会在后面再添加一个 onChange，此时传递给 TextWidget 的就有两个 onChange 了。

    ```tsx
    const { schema, rootSchema, ...rest } = props
    return <TextWidget {...rest} onChange={handleChange} />
    ```

    一般情况下，我们会认为后一个 onChange 会覆盖前一个，但 vue 不是这样的，或者应该说 `@vue/babel-plugin-jsx` 不是这样的，他们会将两个 onChange 变成一个函数数组，这就会导致子组件 TextWidget 调用 onChange 时，提示 onChange 不是一个函数。

    解决方法就是在 `babel.config.js` 中配置 mergeProps: false

    ```js
    module.exports = {
        presets: ['@vue/cli-plugin-babel/preset'],
        plugins: [['@vue/babel-plugin-jsx', { mergeProps: false }]],
    }
    ```

15. Vue 中的双向数据问题

    场景：StringField 是 TextWidget 的父组件的，TextWidget 负责页面上的 input 元素。并且 input 元素上的值是 props 中传递下来的 value 值。

    当 input 文本变更时，TextWidget 会调用父组件的 onChange 来更改 value 值。但是 StringField 接管了子组件的 onChange，不让它的更改生效。

    在 react 中，input 表单的值和 props 中的 value 值是绑定的，所以当 onChange 不生效时，input 框中的值也不会生效。但是在 vue 中则不是这样——input 表单值并不会和 props 的 value 值绑定。

    解决这个问题有两种方式，一种是通过 `nextTick` 函数。vue 是不断地循环一轮 tick 的，nextTick 就是下一轮循环，比如当在 TextWidget 中更改响应值 props.value 时，修改不是同步的，所以我们无法在下一行代码就判断 props.value 的值是否生效（也就是 onChange 是否生效）：

    ```tsx
    const handleInput = (evt: Event) => {
        const target = evt.target as HTMLInputElement
        const value = target.value // 此处 value=1, props.value=0
        props.onChange(value)
        console.log(props.value) // 此时的 props.value 依旧是 0
    }
    ```

    这个时候我们就可以借助 `nextTick`，他可以让我们在下一轮 tick 开始的时候立马执行某些事情，比如下面代码

    ```tsx
    const handleInput = (evt: Event) => {
        const target = evt.target as HTMLInputElement
        const value = target.value // 此处 value=1, props.value=0
        props.onChange(value)
        nextTick(() => {
            if (props.value !== value) { // 如果不相等，说明我们的 onChange 可能被阻断了
                target.value = props.value  // 这个时候需要恢复我们表单的值
            }
        })
    }
    ```

    虽然第一种方式能够解决问题，但如果用户的电脑性能差，则会先看到输入的值成功输入，但下一刻就消失了。原因是每轮 tick 是需要消耗一定的时间的，在本轮 tick 未结束之前，input 中的值依旧是用户输入的值。

    第二种方法是，input 标签不负责数值的更改，input 标签的值始终和 props.value 的值相同，代码如下：

    ```tsx
    const handleInput = (evt: Event) => {
        const target = evt.target as HTMLInputElement
        const value = target.value
        target.value = props.value // 不负责更改
        props.onChange(value)
    }
    ```

16. 表单校验

    目前该系统中有两类校验，一类是 Schema 格式的校验，另一类就是表单的校验。

    对于表单的校验，我们采用用户主动触发的方式，也就是在 SchemaForm 中向外暴露一个校验函数，用户调用该函数，则会执行校验功能。这可以通过 `defineExpose()` 来实现。但 `defineExpose()` 只支持在单文件组件 `<script setup>` 中使用，tsx 中不支持。所以目前使用的方法是：父组件通过 props 传递一个 contextRef 容器给子组件，子组件将要传递给父组件的内容放在 contextRef.value 中，这样父组件就可以收到子组件的内容了。

## 主题系统

该库的主题系统，并不是样式主题。

> 样式主题：
>
> 国内常见的组件库的样式主题，是通过指定不同的 css 样式，然后在编译时直接打包对应的样式文件。国外，比如 react 生态圈的样式主题，是通过 js 导入的方式实现的。两者各有优劣。

该库的主题系统，对允许对叶子结点的组件的自定义，该库提供的服务是：给定一个符合格式的 json Schema 对象，该库会根据该 schema 渲染出对应的“框”，比如 ObjectField 如果指定了 string，则具体的 string 的实现就是主题。比如可以将 input 元素作为 string 组件，也可以将 textarea 元素作为 string 组件，或者直接导入第三方库（element-plus）的组件作为 string 组件。对于我们这个库来说，这些具体的元素的交互逻辑、样式等内容我们不关心，我们只要求的是，你实现的 string 组件，当元素的只变化时，需要调用我提供给你的 props 中的 onChange，同时你显示的表单内容，也必须是我提供给你的 props 中的 value 内容，仅此而已！

从用户的角度观察：它会调用我们的库，然后我们会默认导出一个 SchemaForm，SchemaForm 中定义了 props，这就是用户需要提供的类型，比如 schema 格式、 onChange 和 theme 是必选的。

调用我们的库时，主题是必须传递进来的，因为叶子组件是根据主题中提供的组件进行渲染的，我们库中的 ObjectField 和 ArrayField 并不会渲染在页面上，他们只是中间的逻辑层。虽然我们会提供一个默认主题，但不是每个用户都会使用默认主题，所以我们的默认主题和库之间是分开的，也就是为什么打包时会分别打包这两个内容。

主题 theme 的使用有两种方式，一种是通过 props 传递一个 theme。另一种是创建一个主题组件。前者的使用方式，会将 theme 耦合在 SchemaForm 中，而后一种的话，是纯组件化的设计。对用户而言，使用的区别如下：

```tsx
// 通过 props 传递 theme
<SchemaForm
    schema={demo.schema}
    value={demo.data}
    onChange={handleChange}
    theme={themeDefault}
/>

// 纯组件的 theme
<ThemeProvider theme={themeDefault}>
    <SchemaForm
        schema={demo.schema}
        value={demo.data}
        onChange={handleChange}
    />
</ThemeProvider>
```

对于我们库开发人员而言，纯组件的设计让我们的代码解耦了，比如我们不需要在 SchemaForm 中声明 theme，而是将它提取到了一个组件中。

### 提取出 themeProvider 后打包也更方便了

加入我们的库名称为 jsonschema-form, 主题系统为 jsonschema-form-theme。
由于我们的库中抽离出来了 themeProvider 组件，那么我们在 jsonschema-form-theme 就可以很方便的直接导入 themeProvider，比如下面这样

```js
// 在 jsonschema-form-theme
import { themeProvider } from jsonschema-form
```

由于 themeProvider 是单组件，所以打包时可以只打包 themeProvider，而不会将 SchemaForm 等内容也一起打包进去。

同时，我们的库还可以提供一个 `DefaultThemeProvider` 组件，该组件直接封装了我们默认的主题，这样用户就不需要传递任何 `theme` props 了，所以也不需要导入 default-theme 这个包了，对于用户而言减少了代码量，也减少了 import。

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

4. 类型错误。`DefineComponent` 类型和实际的 `defineComponent` 类型不兼容？

    ```tsx
    const CommonWidgetPropsDefine = {
        // 每个 widget 通用的 props
        value: {
            type: Object as PropType<any>,
        },
        onChange: {
            type: Function as PropType<(v: any) => void>,
            required: true,
        },
    } as const
    export const SelectWeightPropsDefine = {
        ...CommonWidgetPropsDefine,
        options: {
            type: Array as PropType<
                {
                    value: string
                    info: any
                }[]
            >,
            required: true,
        },
    } as const

    // 下面这两句是核心，问题在于两者的 proprs 都相同，但类型却不相同，当然，解决方式是有的，但这个问题似乎一直存在。按照老师当时的说法是，vue3 没有舍弃以前的类似。
    // 对于我们来说，类型的定义只需要 props 就可以了，但是 vue 却要求很多其他内容，比如 data, watch 之类的。
    // 当然，上面这个解释只是老师当时遇到的问题，现在已经过去两年了，按理来说问题应该已经解决了，所以我这个可能是其他原因导致的也说不定。
    type SelectWeightDefine = DefineComponent<typeof SelectWeightPropsDefine>

    const a: SelectWeightDefine = defineComponent({
        // 报错❌
        props: SelectWeightPropsDefine,
    })
    ```

    经过我的不懈努力——慢慢展开对象查看，然后发现这样并没有什么用，因为报错的信息太太太长了。但是通过编辑器的高亮功能，我最终还是明白了大概是什么情况。
    这大概率还是 vue 的锅，报错信息其实就是在说 `defineComponent()` 返回的对象类型的 `$props` 属性上面没有 `onChange`，但是在 `DefineComponent` 的 `$props` 上面却要求有 `onChange`。

    报错信息就是这样，但实际上可能还有更深层次的原因，因为如果把 `onChange` 改为 `onaChange`，报错就消失了！但如果改成 `on1Change` 或者 `onChangeabc` 就没有效果！这就很神奇了。

    具体的分析后面有时间再弄，现在就先进行强制类型声明吧。
