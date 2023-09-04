import * as Monaco from 'monaco-editor'
import {
    PropType,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
} from 'vue'
import { createUseStyles } from 'vue-jss'

const useStyles = createUseStyles({
    container: {
        border: '1px solid #eee',
        borderRadius: 5,
        // 没有这个样式，渲染会出问题
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        backgroundColor: '#eee',
        padding: '10px 0',
        paddingLeft: 20,
    },
    code: {
        flexGrow: 1,
    },
})

const propsType = {
    code: {
        type: String as PropType<string>,
        required: true,
    },
    onChange: {
        type: Function as PropType<
            (
                value: string,
                event: Monaco.editor.IModelContentChangedEvent
            ) => void
        >,
        required: true,
    },
    title: {
        type: String as PropType<string>,
        required: true,
    },
} as const

export default defineComponent({
    props: propsType,
    setup(props) {
        // 必须是 shallowRef，否则 editor.getValue() 无法正常工作
        const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>(null!) // eslint-disable-line

        const containerRef = ref()

        let _subscription: Monaco.IDisposable | undefined
        let __prevent_trigger_change_event = false

        onMounted(() => {
            const editor = (editorRef.value = Monaco.editor.create(
                containerRef.value,
                {
                    value: props.code,
                    language: 'json',
                    formatOnPaste: true,
                    tabSize: 2,
                    minimap: {
                        enabled: false,
                    },
                }
            ))

            _subscription = editor.onDidChangeModelContent(
                (event: Monaco.editor.IModelContentChangedEvent) => {
                    console.log('----------->', __prevent_trigger_change_event)
                    if (!__prevent_trigger_change_event) {
                        props.onChange(editor.getValue(), event)
                    }
                }
            )
        })

        onBeforeUnmount(() => {
            if (_subscription) {
                _subscription.dispose()
            }
        })

        watch(
            () => props.code,
            (v) => {
                const editor = editorRef.value
                const model = editor.getModel()
                if (v !== model?.getValue()) {
                    editor.pushUndoStop()
                    __prevent_trigger_change_event = true
                    // pushEditOperations 函数要求提供第三个参数 cursorComputer，但似乎不提供也没有问题。
                    model?.pushEditOperations(
                        [],
                        [
                            {
                                range: model.getFullModelRange(),
                                text: v,
                            },
                        ],
                        () => null
                    )
                    editor.pushUndoStop()
                    __prevent_trigger_change_event = false
                }
                // if (v !== editorRef.value.getValue()) {
                //   editorRef.value.setValue(v)
                // }
            }
        )

        const classesRef = useStyles()
        return () => {
            const classes = classesRef.value
            return (
                <div class={classes.container}>
                    <header class={classes.title}>
                        <p>{props.title}</p>
                    </header>
                    <div ref={containerRef} class={classes.code}></div>
                </div>
            )
        }
    },
})
