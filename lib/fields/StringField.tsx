import { getWidget } from '../ThemeProvider'
import { CommonWidgetName, FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'StringField',
    props: FieldPropsDefine,
    setup(props) {
        const TextWidgetRef = getWidget(CommonWidgetName.TextWidgetName)

        // 📚 组件有时会对上级传递下来 change 事件进行封装，然后再传递给子组件。
        //    这样我们就可以对子组件的修改内容进行处理
        const handleChange = (val: string | any) => {
            props.onChange(val)
        }

        return () => {
            const TextWidget = TextWidgetRef.value
            /*
            TODO: 虽然可以通过
                const { schema, rootSchema, ...rest } = props
                <TextWidget {...rest} />
            传递 props，但似乎这种方式得不到类型校验，因为当 rest 都缺少所需要的 props 时，依旧不会提示任何内容
            */
            const { value, errorSchema, schema } = props
            return (
                <TextWidget
                    value={value}
                    onChange={handleChange}
                    errors={errorSchema.__errors || []}
                    schema={schema}
                />
            )
        }
    },
})
