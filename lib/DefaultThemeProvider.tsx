import { defineComponent } from 'vue'
import ThemeProvider from './ThemeProvider'
import themeDefault from './theme/theme-default'

export default defineComponent({
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
