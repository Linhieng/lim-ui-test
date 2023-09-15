import {
    Ref,
    defineComponent,
    provide,
    shallowRef,
    watch,
    watchEffect,
} from 'vue'

import SchemaItems from './SchemaItems'
import { SCHEMA_FORM_CONTEXT_KEY } from './context'
import { SchemaFormPropsDefine } from './types'
import Ajv from 'ajv'

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

        const validatorRef = shallowRef() as Ref<Ajv.Ajv>

        watchEffect(() => {
            validatorRef.value = new Ajv({
                ...props.ajvOptions,
            })
        })

        function doValidate() {
            const validator = validatorRef.value
            let valid = false,
                schemaError
            try {
                valid = validator.validate(props.schema, props.value) as boolean
            } catch (error) {
                schemaError = error
            }

            return {
                // Ajv 的校验结果会放在 errors 上面。
                errors: validator.errors || [],
                valid,
                schemaError,
            }
        }

        watch(
            () => props.contextRef,
            () => {
                if (props.contextRef) {
                    // eslint-disable-next-line vue/no-mutating-props
                    props.contextRef.value = { doValidate }
                }
            },
            {
                immediate: true,
            }
        )

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
