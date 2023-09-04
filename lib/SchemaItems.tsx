import { defineComponent } from 'vue'
import { FieldPropsDefine, SchemaTypesEnum } from './types'
import StringField from './fields/StringField'
import NumberField from './fields/NumberField'

// 该组件的工作就是将不同类型的 schema， 交给不同的组件去完成
export default defineComponent({
    name: 'SchemaItems',
    props: FieldPropsDefine,
    setup(props) {
        return () => {
            const { schema } = props

            // TODO: 如果 type 没有指定，我们需要猜测这个 type
            const schemaType = schema.type
            let Component: any

            switch (schemaType) {
                case SchemaTypesEnum.STRING: {
                    Component = StringField
                    break
                }
                case SchemaTypesEnum.NUMBER: {
                    Component = NumberField
                    break
                }
                default: {
                    console.warn(`${schemaType} is not supported`)
                }
            }

            return <Component {...props} />
        }
    },
})
