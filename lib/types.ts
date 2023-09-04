import { PropType } from 'vue'

export enum SchemaTypesEnum {
    'NUMBER' = 'number',
    'INTEGER' = 'integer',
    'STRING' = 'string',
    'OBJECT' = 'object',
    'ARRAY' = 'array',
    'BOOLEAN' = 'boolean',
}

// TODO: 举例说明
type SchemaRef = {
    $ref: string
}

export interface Schema {
    type: SchemaTypesEnum | string
    const?: any
    format?: string
    default?: any
    properties?: {
        [key: string]: Schema | { $ref: string }
    }
    items?: Schema | Schema[] | SchemaRef
    dependencies?: {
        [key: string]: string[] | Schema | SchemaRef
    }
    oneOf?: Schema[]
    // vjsf?: VueJsonSchemaConfig
    required?: string[]
    enum?: any[]
    enumKeyValue?: any[]
    additionalProperties?: any
    additionalItems?: Schema
}

export const FieldPropsDefine = {
    schema: {
        type: Object as PropType<Schema>,
        required: true,
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
