import { createUseStyles } from 'vue-jss'
import { useSchemaFormContext } from '../context'
import { FieldPropsDefine, Schema } from '../types'
import { PropType, defineComponent } from 'vue'

/*
该组件支持下面三种类型
1. 多类型数组
    {
        items: [
            { type: string },
            { type: number },
        ],
    }
2. 单类型数据
    {
        items: { type: string },
    }
3. 单类型数组，并且支持枚举值
    {
        items: {
            type: string,
            enum: ['a', 'b', 'c'],
        },
    }
*/

function defaultArray(val: any) {
    if (Array.isArray(val)) {
        return val
    } else {
        return []
    }
}

const useStyles = createUseStyles({
    container: {
        marginTop: 5,
        boxShadow: '0 0 10px 0 #aaa',
    },
    actions: {
        background: '#eee',
        padding: 10,
        textAlign: 'right',
    },
    action: {
        '& + &': {
            marginLeft: 10,
        },
    },
    content: {
        padding: 10,
    },
})

const ArrayItemWrapper = defineComponent({
    name: 'ArrayItemWrapper',
    props: {
        index: {
            type: Number as PropType<number>,
            required: true,
        },
        onAdd: {
            type: Function as PropType<(index: number) => void>,
            required: true,
        },
        onDelete: {
            type: Function as PropType<(index: number) => void>,
            required: true,
        },
        onUp: {
            type: Function as PropType<(index: number) => void>,
            required: true,
        },
        onDown: {
            type: Function as PropType<(index: number) => void>,
            required: true,
        },
    },
    setup(props, { slots }) {
        const classesRef = useStyles()

        return () => {
            const classes = classesRef.value

            const handleAdd = () => props.onAdd(props.index)
            const handleDelete = () => props.onDelete(props.index)
            const handleUp = () => props.onUp(props.index)
            const handleDown = () => props.onDown(props.index)

            return (
                <div class={classes.container}>
                    <div class={classes.actions}>
                        <button class={classes.action} onClick={handleAdd}>
                            新增
                        </button>
                        <button class={classes.action} onClick={handleDelete}>
                            删除
                        </button>
                        <button class={classes.action} onClick={handleUp}>
                            上移
                        </button>
                        <button class={classes.action} onClick={handleDown}>
                            下移
                        </button>
                    </div>
                    <div class={classes.content}>
                        {slots.default && slots.default()}
                    </div>
                </div>
            )
        }
    },
})

export default defineComponent({
    name: 'ArrayField',
    props: FieldPropsDefine,
    setup(props) {
        const context = useSchemaFormContext()

        const handleArrayFieldChange = (index: number, val: any) => {
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            newValue[index] = val
            onChange(newValue)
        }

        const handleAdd = (index: number) => {
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            newValue.splice(index + 1, 0, undefined)
            onChange(newValue)
        }
        const handleDelete = (index: number) => {
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            newValue.splice(index, 1)
            onChange(newValue)
        }
        const handleUp = (index: number) => {
            if (index < 1) {
                return
            }
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            const moveItem = newValue.splice(index, 1)
            newValue.splice(index - 1, 0, moveItem[0])
            onChange(newValue)
        }
        const handleDown = (index: number) => {
            const { value: oldValue, onChange } = props
            const newValue = defaultArray(oldValue)
            if (index >= newValue.length - 1) {
                return
            }
            const moveItem = newValue.splice(index, 1)
            newValue.splice(index + 1, 0, moveItem[0])
            onChange(newValue)
        }

        return () => {
            const SchemaItems = context.SchemaItems
            const { schema, rootSchema, value } = props

            const isMultiType = Array.isArray(schema.items)
            const isSingleType = schema.items && !(schema.items as any).enum

            if (isMultiType) {
                const items = schema.items as Schema[]
                const valArr = defaultArray(value)
                return items.map((s: Schema, i: number) => (
                    <SchemaItems
                        schema={s}
                        rootSchema={rootSchema}
                        value={valArr[i]}
                        onChange={(v: any) => handleArrayFieldChange(i, v)}
                        key={i}
                    />
                ))
            } else if (isSingleType) {
                const singleSchema = schema.items as Schema
                const valArr = defaultArray(value)
                // TODO: 这里是根据 valArr 进行渲染的，这意味着没有值是将不会渲染任何东西，是否要默认渲染一个内容呢？
                return valArr.map((v: any, i: number) => {
                    return (
                        <ArrayItemWrapper
                            index={i}
                            onAdd={handleAdd}
                            onDelete={handleDelete}
                            onUp={handleUp}
                            onDown={handleDown}
                        >
                            <SchemaItems
                                schema={singleSchema}
                                rootSchema={rootSchema}
                                value={v}
                                onChange={(v: any) =>
                                    handleArrayFieldChange(i, v)
                                }
                            />
                        </ArrayItemWrapper>
                    )
                })
            }

            return <div>This is Array Field</div>
        }
    },
})
