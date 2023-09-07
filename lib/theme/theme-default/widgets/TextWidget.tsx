import { TextWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'TextWidget',
    props: TextWidgetPropsDefine,
    setup(props) {
        const handleInput = (evt: Event) => {
            const target = evt.target as HTMLInputElement
            const value = target.value
            target.value = props.value
            props.onChange(value)
        }
        return () => {
            return (
                <input type="text" value={props.value} onInput={handleInput} />
            )
        }
    },
})
