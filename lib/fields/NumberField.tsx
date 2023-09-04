import { FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'NumberField',
    props: FieldPropsDefine,
    setup() {
        return () => {
            return <div>This is Number Field</div>
        }
    },
})
