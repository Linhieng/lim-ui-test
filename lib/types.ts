import { PropType } from 'vue'

export enum SchemaTypesEnum {
    'NUMBER' = 'number',
    'INTEGER' = 'integer',
    'STRING' = 'string',
    'OBJECT' = 'object',
    'ARRAY' = 'array',
    'BOOLEAN' = 'boolean',
}

// $ref 表示引用自其他的 schema。
// 比如 $ref: '#/defined/xxx' 表示该 Schema 的定义引用自动 '#/defined/xxx' 位置的定义。
// # 表示根目录。每一个 Schema 都有一个路径。
type SchemaRef = {
    $ref: string
}

export interface Schema {
    type?: SchemaTypesEnum | string
    const?: any
    format?: string

    title?: string
    default?: any

    properties?: {
        [key: string]: Schema | { $ref: string }
    }
    items?: Schema | Schema[] | SchemaRef
    uniqueItems?: any
    dependencies?: {
        [key: string]: string[] | Schema | SchemaRef
    }
    oneOf?: Schema[]
    anyOf?: Schema[]
    allOf?: Schema[]
    // TODO: uiSchema
    // vjsf?: VueJsonSchemaConfig
    required?: string[]
    enum?: any[]
    enumNames?: any[]
    enumKeyValue?: any[]
    additionalProperties?: any
    additionalItems?: Schema

    minLength?: number
    maxLength?: number
    minimun?: number
    maximum?: number
    multipleOf?: number
    exclusiveMaximum?: number
    exclusiveMinimum?: number
}

export const FieldPropsDefine = {
    schema: {
        type: Object as PropType<Schema>,
        required: true,
    },
    rootSchema: {
        type: Object as PropType<Schema>,
        // required: true,
    },
    value: {
        // 没有写 type，表示任意值
        required: true,
    },
    onChange: {
        type: Function as PropType<(value: any) => void>,
        required: true,
    },
} as const
