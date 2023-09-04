import { defineComponent } from 'vue'

export default defineComponent({
    name: 'StringField',
    setup() {
        return () => {
            return <input type="text" placeholder="占位符" />
        }
    },
})
