import { Ref, defineComponent, ref } from 'vue'
import { createUseStyles } from 'vue-jss'

import MonacoEditor from './components/MonacoEditor'

function toJson(data: unknown) {
    return JSON.stringify(data, null, 2)
}

const schema = {
    type: 'string',
}

const useStyles = createUseStyles({
    editor: {
        minHeight: '400px',
        boxShadow: '0 0 10px 0 #aaaaaa',
    },
})

export default defineComponent({
    setup() {
        const schemaRef: Ref<unknown> = ref(schema)

        const handleCodeChange = (code: string) => {
            let schema: unknown
            try {
                schema = JSON.parse(code)
                // eslint-disable-next-line no-empty
            } catch (err) {}
            schemaRef.value = schema
        }

        const classRef = useStyles()

        return () => {
            const classes = classRef.value
            const code = toJson(schemaRef.value)

            return (
                <div>
                    <MonacoEditor
                        code={code}
                        onChange={handleCodeChange}
                        title="Schema"
                        class={classes.editor}
                    />
                </div>
            )
        }
    },
})
