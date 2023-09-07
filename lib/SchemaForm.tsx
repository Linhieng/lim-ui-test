import { defineComponent, provide } from 'vue'

import SchemaItems from './SchemaItems'
import { SCHEMA_FORM_CONTEXT_KEY } from './context'
import { SchemaFormPropsDefine } from './types'

// 📚 SchemaForm 是入口。对于用户来时，它只负责传入一个 Schema，而我们（lib）要做的事情就是将这个 Schema 转换成对应的组件进行渲染。
export default defineComponent({
    name: 'SchemaForm',
    props: SchemaFormPropsDefine,
    setup(props) {
        // 可能还要再做一层封装，所以单独拿出来
        const handleChange = (v: any) => {
            props.onChange(v)
        }

        // 📚 SchemaItems 是不变的，不需要响应性
        provide(SCHEMA_FORM_CONTEXT_KEY, {
            SchemaItems,
        })

        return () => {
            const { schema, value } = props

            return (
                <SchemaItems
                    schema={schema}
                    rootSchema={schema}
                    value={value}
                    onChange={handleChange}
                />
            )
        }
    },
})
