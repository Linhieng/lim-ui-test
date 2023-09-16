import { NumberWidgetDefine, NumberWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'

const NumberWidget /* : NumberWidgetDefine */ = defineComponent({
    name: 'NumberWidget',
    props: NumberWidgetPropsDefine,
    setup(props) {
        const handleInput = (evt: Event) => {
            const target = evt.target as HTMLInputElement
            const value = target.value
            target.value = props.value
            const num = Number(value)
            // 因为表单是 number 类型，非数字类型会被转换为空字符串，空字符串经过 Number() 在值为 0。故无需判断 Number.isNaN(num)
            props.onChange(num)
        }
        return () => {
            return (
                <div>
                    <input
                        type="number"
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
}) as NumberWidgetDefine

export default NumberWidget
