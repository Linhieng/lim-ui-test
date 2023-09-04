import { defineComponent } from 'vue'

import { FieldPropsDefine } from './types'
import SchemaItems from './SchemaItems'

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
                    value={value}
                    onChange={handleChange}
                />
            )
        }
    },
})
