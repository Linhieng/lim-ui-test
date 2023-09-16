import { TextWidgetDefine, TextWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'

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
                <div>
                    <input
                        type="text"
                        value={props.value}
                        onInput={handleInput}
                    />
                    <ul>
                        {props.errors.map((error) => (
                            <li>{error}</li>
                        ))}
                    </ul>
                </div>
            )
        }
    },
}) as TextWidgetDefine

export default TextWidget
