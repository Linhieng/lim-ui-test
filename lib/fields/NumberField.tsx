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
            if (Number.isNaN(num)) {
                props.onChange(undefined)
            } else {
                props.onChange(num)
            }
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
