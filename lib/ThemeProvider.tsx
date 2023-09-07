import {
    ComputedRef,
    InjectionKey,
    PropType,
    computed,
    defineComponent,
    inject,
    provide,
} from 'vue'
import { Theme } from './types'

const THEME_PROVIDER_KEY = Symbol() as InjectionKey<ComputedRef<Theme>>
const PropsDefine = {
    theme: {
        type: Object as PropType<Theme>,
        required: true,
    },
} as const

export default defineComponent({
    name: 'ThemeProvider',
    props: PropsDefine,
    setup(props, { slots }) {
        const context = computed(() => props.theme)
        provide(THEME_PROVIDER_KEY, context)
        return () => slots.default && slots.default()
    },
})

export function getWidget(name: string) {
    const context = inject(THEME_PROVIDER_KEY)
    if (!context) {
        throw new Error('theme required')
    }
    // 📚 由于 theme 是通过 props 传递下来的，所以我们需要考虑到可能会变化，故通过 computed 获取值。
    const widgetRef = computed(() => {
        return (context.value.witgets as any)[name]
    })

    return widgetRef
}
