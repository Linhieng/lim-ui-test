import { InjectionKey, inject } from 'vue'
import SchemaItems from './SchemaItems'
import { Theme } from './types'

export const SCHEMA_FORM_CONTEXT_KEY = Symbol() as InjectionKey<{
    SchemaItems: typeof SchemaItems
    theme: Theme
}>

export function useSchemaFormContext() {
    const context = inject(SCHEMA_FORM_CONTEXT_KEY)

    if (!context) {
        throw Error('Component SchemaForm must be used')
    }

    return context
}
