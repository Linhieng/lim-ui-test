import { FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'StringField',
    props: FieldPropsDefine,
    setup(props) {
        const handleStringFieldChange = (evt: Event) => {
            const target = evt.target as HTMLInputElement
            const value = target.value
            props.onChange(value)
        }

        return () => {
            return (
                <input
                    type="string"
                    value={props.value}
                    onInput={handleStringFieldChange}
                />
            )
        }
    },
})
