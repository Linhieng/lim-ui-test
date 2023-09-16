import { TextWidgetDefine, TextWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'
import FormItem from '../FormItem'

const TextWidget /* : TextWidgetDefine */ = defineComponent({
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
                <FormItem {...props}>
                    <input
                        type="text"
                        value={props.value}
                        onInput={handleInput}
                    />
                </FormItem>
            )
        }
    },
}) as TextWidgetDefine

export default TextWidget
