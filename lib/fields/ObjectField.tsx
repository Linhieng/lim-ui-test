import { isObject } from '../utils'
import { SCHEMA_FORM_CONTEXT_KEY } from '../context'
import { FieldPropsDefine } from '../types'
import { defineComponent, inject } from 'vue'

export default defineComponent({
    name: 'ObjectField',
    props: FieldPropsDefine,
    setup(props) {
        const context = inject(SCHEMA_FORM_CONTEXT_KEY)

        // 📚 用户可能直接调用该组件，此时 context 将会是 undefined
        if (!context) {
            throw Error('Component SchemaForm must be used')
        }

        const handleObjectFieldChange = (key: string, val: any) => {
            // 📚 这是 Object 组件，所以该组件的值是一个 Object。而该函数的 key,val 就是 value 中的某一键值对
            const { onChange, value: oldValue } = props
            const value: Record<string, any> = isObject(oldValue)
                ? (oldValue as any)
                : {}

            if (val === undefined) {
                delete value[val]
            } else {
                value[key] = val
            }
            onChange(value)
        }

        return () => {
            // 📚 如果前面没有处理 context 为 undefined 的情况，那么这里的解构赋值就会报错
            const { SchemaItems } = context

            const { schema, rootSchema, value } = props

            const currentValue: Record<string, any> = isObject(value)
                ? (value as any)
                : {}
            const properties = schema.properties || {}

            return Object.keys(properties).map((k: string, index: number) => (
                <SchemaItems
                    schema={properties[k]}
                    rootSchema={rootSchema}
                    value={currentValue[k]}
                    key={index} // TODO: 这个 key 是为了让 vue 区分不同组件的，那么直接使用 Symbol() 是否有副作用呢？
                    onChange={(v: any) => {
                        handleObjectFieldChange(k, v)
                    }}
                />
            ))
        }
    },
})
