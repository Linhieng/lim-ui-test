import { useSchemaFormContext } from '../context'
import { FieldPropsDefine, Schema } from '../types'
import { defineComponent } from 'vue'

/*
该组件支持下面三种类型
1. 多类型数组
    {
        items: [
            { type: string },
            { type: number },
        ],
    }
2. 单类型数据
    {
        items: { type: string },
    }
3. 单类型数组，并且支持枚举值
    {
        items: {
            type: string,
            enum: ['a', 'b', 'c'],
        },
    }
*/

function defaultArray(val: any) {
    if (Array.isArray(val)) {
        return val
    } else {
        return []
    }
}
export default defineComponent({
    name: 'ArrayField',
    props: FieldPropsDefine,
    setup(props) {
        const context = useSchemaFormContext()

        const handleArrayFieldChange = (index: number, val: any) => {
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            newValue[index] = val
            onChange(newValue)
        }

        return () => {
            const SchemaItems = context.SchemaItems
            const { schema, rootSchema, value } = props

            const isMultiType = Array.isArray(schema.items)

            if (isMultiType) {
                const items = schema.items as Schema[]
                const valArr = defaultArray(value)
                return items.map((s: Schema, i: number) => (
                    <SchemaItems
                        schema={s}
                        rootSchema={rootSchema}
                        value={valArr[i]}
                        onChange={(v: any) => handleArrayFieldChange(i, v)}
                        key={i}
                    />
                ))
            }

            return <div>This is Array Field</div>
        }
    },
})
