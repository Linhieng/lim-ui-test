import { FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'NumberField',
    props: FieldPropsDefine,
    setup(props) {
        const handleNumberFieldChange = (evt: Event) => {
            const target = evt.target as HTMLInputElement
            const value = target.value
            const num = Number(value)
            // 由于表单限制为 number 类型，所以 value 的值只可能是一个数字，或者一个空字符串。故无需判断 Number.isNaN(num)
            props.onChange(num)
        }

        return () => {
            return (
                <input
                    type="number"
                    value={props.value}
                    onInput={handleNumberFieldChange}
                />
            )
        }
    },
})
