import { SelectWeightDefine, SelectWeightPropsDefine } from '../../../types'
import { defineComponent, ref, watch } from 'vue'
import { WithFormItem } from '../FormItem'

const SelectionWidget /* : SelectWeightDefine */ = WithFormItem(
    defineComponent({
        name: 'SelectionWidget',
        props: SelectWeightPropsDefine,
        setup(props) {
            const currentValueRef = ref(props.value || [])
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
) as SelectWeightDefine

export default SelectionWidget
