import { getWidget } from '../ThemeProvider'
import { CommonWidgetName, FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'NumberField',
    props: FieldPropsDefine,
    setup(props) {
        const NumberWidgetRef = getWidget(CommonWidgetName.NumberWidgetName)
        const handleChange = (val: number) => {
            props.onChange(val)
        }

        return () => {
            const NumberWidget = NumberWidgetRef.value
            const { value } = props
            return <NumberWidget value={value} onChange={handleChange} />
        }
    },
})
