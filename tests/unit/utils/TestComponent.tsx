import { defineComponent } from 'vue'
import SchemaForm, { SchemaFormPropsDefine } from '../../../lib'
import ThemeProvider from '../../../lib/ThemeProvider'
import themeDefault from '../../../lib/theme/theme-default'

const DefaultThemeProvider = defineComponent({
    name: 'DefaultThemeProvider',
    setup(props, { slots }) {
        return () => {
            return (
                <ThemeProvider theme={themeDefault}>
                    {slots.default && slots.default()}
                </ThemeProvider>
            )
        }
    },
})

export default defineComponent({
    name: 'TestComponent',
    props: SchemaFormPropsDefine,
    setup(props) {
        return () => {
            return (
                <DefaultThemeProvider>
                    <SchemaForm {...props} />
                </DefaultThemeProvider>
            )
        }
    },
})
