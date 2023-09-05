import { defineComponent } from 'vue'

import { FieldPropsDefine } from './types'
import SchemaItems from './SchemaItems'

// 📚 SchemaForm 是入口。对于用户来时，它只负责传入一个 Schema，而我们（lib）要做的事情就是将这个 Schema 转换成对应的组件进行渲染。
export default defineComponent({
    name: 'SchemaForm',
    props: FieldPropsDefine,
    setup(props) {
        // 可能还要再做一层封装，所以单独拿出来
        const handleChange = (v: any) => {
            props.onChange(v)
        }

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
