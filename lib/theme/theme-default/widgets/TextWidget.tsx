import { TextWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'TextWidget',
    props: TextWidgetPropsDefine,
    setup(props) {
        return () => {
            return <div>TextWidget</div>
        }
    },
})
