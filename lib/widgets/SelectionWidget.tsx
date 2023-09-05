import { PropType, defineComponent, ref, watch } from 'vue'

// TODO: 这一块的实现逻辑有点怪怪的。
export default defineComponent({
    name: 'SelectionWidget',
    props: {
        // 📚 数据流变化方向： props.value ---> currentValue ---> onChange ---> props.value
        value: {
            type: String as PropType<string>,
        },
        onChange: {
            type: Function as PropType<(val: any) => void>,
            required: true,
        },
        options: {
            type: Array as PropType<
                {
                    value: string
                    info: any
                }[]
            >,
            required: true,
        },
    },
    setup(props) {
        const currentValueRef = ref(props.value)
        watch(
            () => props.value,
            (newValue: any) => {
                if (newValue !== currentValueRef.value) {
                    currentValueRef.value = newValue
                }
            }
        )

        // 📚 响应式变量可直接监听
        watch(currentValueRef, (newValue: any) => {
            if (newValue !== props.value) {
                props.onChange(newValue)
            }
        })

        return () => {
            const { options } = props
            // 这里不能写成 const currentValue = currentValueRef.value
            //                  v-model={currentValue}
            // 因为 v-model 会直接绑定传入的值，而我们的 currentValue 设置为 const 表示不允许修改。
            return (
                <select multiple={true} v-model={currentValueRef.value}>
                    {options.map((option) => (
                        <option value={option.value}>{option.info}</option>
                    ))}
                </select>
            )
        }
    },
})
