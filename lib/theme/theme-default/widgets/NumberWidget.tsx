import { NumberWidgetPropsDefine } from '../../../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'NumberWidget',
    props: NumberWidgetPropsDefine,
    setup(props) {
        return () => {
            return <div>NumberWidget</div>
        }
    },
})
