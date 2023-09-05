import { InjectionKey } from 'vue'
import SchemaItems from './SchemaItems'

export const SCHEMA_FORM_CONTEXT_KEY = Symbol() as InjectionKey<{
    SchemaItems: typeof SchemaItems
}>
