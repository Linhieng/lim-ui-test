import { defineComponent, reactive, ref, watchEffect } from 'vue'
import { createUseStyles } from 'vue-jss'

import MonacoEditor from './components/MonacoEditor'
import SchemaForm from '../lib'
import themeDefault from '../lib/theme/theme-default'
import ThemeProvider from '../lib/ThemeProvider'

import demos from './demo'

// TODO: 在 lib 中导入 Schema 和 UISchema 的类型声明，而不是在这里写死
type SchemaType = any
type UISchemaType = any
type DemoType = {
    schema: SchemaType | null
    uiSchema: UISchemaType | null
    data: unknown
    schemaCode: string
    uiSchemaCode: string
    dataCode: string
}

function toJson(data: unknown) {
    return JSON.stringify(data, null, 2)
}

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '1200px',
        margin: '0 auto',
    },
    menu: {
        marginBottom: 20,
    },
    code: {
        width: 700,
        flexShrink: 0,
    },
    codePanel: {
        minHeight: 400,
        marginBottom: 20,
    },
    uiAndValue: {
        display: 'flex',
        justifyContent: 'space-between',
        '& > *': {
            width: '46%',
        },
    },
    content: {
        display: 'flex',
    },
    form: {
        padding: '0 20px',
        flexGrow: 1,
    },
    menuButton: {
        appearance: 'none',
        borderWidth: 0,
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'inline-block',
        padding: 15,
        borderRadius: 5,
        '&:hover': {
            background: '#efefef',
        },
    },
    menuSelected: {
        background: '#337ab7',
        color: '#fff',
        '&:hover': {
            background: '#337ab7',
        },
    },
})

export default defineComponent({
    setup() {
        const exampleIndexRef = ref<number>(0)
        const classRef = useStyles()

        const demo = reactive<DemoType>({
            schema: null,
            data: {},
            uiSchema: {},
            dataCode: '',
            schemaCode: '',
            uiSchemaCode: '',
        })

        function factoryHandleCodeChange(
            field: 'schema' | 'data' | 'uiSchema',
            value: string
        ) {
            try {
                const json = JSON.parse(value)
                demo[field] = json
                demo[`${field}Code`] = value
            } catch (err) {
                // do someting
            }
        }

        const handleChange = (v: any) => {
            demo.data = v
            demo.dataCode = toJson(v)
        }
        const handleSchemaChange = (v: string) =>
            factoryHandleCodeChange('schema', v)
        const handleDataChange = (v: string) =>
            factoryHandleCodeChange('data', v)
        const handleUISchemaChange = (v: string) =>
            factoryHandleCodeChange('uiSchema', v)

        watchEffect(() => {
            const index = exampleIndexRef.value
            const example = demos[index]
            demo.schema = example.schema
            demo.uiSchema = example.uiSchema
            demo.data = example.default
            demo.schemaCode = toJson(example.schema)
            demo.uiSchemaCode = toJson(example.uiSchema)
            demo.dataCode = toJson(example.default)
        })

        function renderExampleBtn() {
            const classes = classRef.value
            const exampleIndex = exampleIndexRef.value

            return demos.map((demo, i) => (
                <button
                    class={{
                        [classes.menuButton]: true,
                        [classes.menuSelected]: i === exampleIndex,
                    }}
                    onClick={() => {
                        exampleIndexRef.value = i
                    }}
                >
                    {demo.name}
                </button>
            ))
        }

        function renderCodeEditor() {
            const classes = classRef.value
            return (
                <div class={classes.code}>
                    <MonacoEditor
                        code={demo.schemaCode}
                        class={classes.codePanel}
                        onChange={handleSchemaChange}
                        title="Schema"
                    />
                    <div class={classes.uiAndValue}>
                        <MonacoEditor
                            code={demo.uiSchemaCode}
                            class={classes.codePanel}
                            onChange={handleUISchemaChange}
                            title="UISchema"
                        />
                        <MonacoEditor
                            code={demo.dataCode}
                            class={classes.codePanel}
                            onChange={handleDataChange}
                            title="Value"
                        />
                    </div>
                </div>
            )
        }

        return () => {
            const classes = classRef.value

            return (
                <div class={classes.container}>
                    <header class={classes.menu}>
                        <h1>Vue3 JsonSchema Form</h1>
                        <div>{renderExampleBtn()}</div>
                    </header>
                    <main class={classes.content}>
                        {renderCodeEditor()}
                        <div class={classes.form}>
                            <ThemeProvider theme={themeDefault}>
                                <SchemaForm
                                    schema={demo.schema}
                                    value={demo.data}
                                    onChange={handleChange}
                                />
                            </ThemeProvider>
                        </div>
                    </main>
                </div>
            )
        }
    },
})
