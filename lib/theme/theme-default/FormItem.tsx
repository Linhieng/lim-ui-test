import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../types'
import { createUseStyles } from 'vue-jss'

const useStyles = createUseStyles({
    formItemContainer: {
        margin: 10,
    },
    formLabel: {
        'margin-right': 5,
    },
    errorTextItem: {
        color: 'red',
    },
})
const FormItem = defineComponent({
    name: 'FormItem',
    props: CommonWidgetPropsDefine,
    setup(props, { slots }) {
        const classesRef = useStyles()

        return () => {
            const classes = classesRef.value
            const { schema } = props
            return (
                <div class={classes.formItemContainer}>
                    <label class={classes.formLabel}>{schema.title}</label>
                    {slots.default && slots.default()}
                    <ul>
                        {props.errors.map((error) => (
                            <li class={classes.errorTextItem}>{error}</li>
                        ))}
                    </ul>
                </div>
            )
        }
    },
})

export default FormItem

// TODO: 类型定义
export function WithFormItem(WidgetComp: any) {
    return defineComponent({
        name: WidgetComp.name,
        props: WidgetComp.props,
        setup(props) {
            return () => {
                return (
                    <FormItem {...(props as any)}>
                        <WidgetComp {...(props as any)} />
                    </FormItem>
                )
            }
        },
    })
}
