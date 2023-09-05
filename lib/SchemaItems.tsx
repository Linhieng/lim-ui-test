import { computed, defineComponent } from 'vue'
import { FieldPropsDefine, SchemaTypesEnum } from './types'
import ObjectField from './fields/ObjectField'
import ArrayField from './fields/ArrayField'
import StringField from './fields/StringField.vue'
import NumberField from './fields/NumberField.vue'

import { retrieveSchema } from './utils'

// 📚 所有的 Schema 都由 SchemaItems 负责分发。
export default defineComponent({
    name: 'SchemaItems',
    props: FieldPropsDefine,
    setup(props) {
        // 📚 由于 schema 的变化频率不高，retrieveSchema 也会消耗一定的性能，所以放在 computed 中，仅当 Schema 变化时才重新计算 Schema
        const retrievedSchemaRef = computed(() => {
            // 📚 注意这里要把 props computed 里面，而不是放在外面。因为放在外面会丢失响应性。
            const { schema, rootSchema, value } = props
            return retrieveSchema(schema, rootSchema, value)
        })

        return () => {
            const { schema } = props
            const retrievedSchema = retrievedSchemaRef.value

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
                case SchemaTypesEnum.OBJECT: {
                    Component = ObjectField
                    break
                }
                case SchemaTypesEnum.ARRAY: {
                    Component = ArrayField
                    break
                }
                default: {
                    console.warn(`${schemaType} is not supported`)
                }
            }

            return <Component {...props} schema={retrievedSchema} />
        }
    },
})
