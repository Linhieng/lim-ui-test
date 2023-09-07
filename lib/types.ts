import { DefineComponent, PropType } from 'vue'

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
        [key: string]: Schema /* Schema 本身就包含了 { $ref: string } */
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

export const SchemaFormPropsDefine = {
    schema: {
        type: Object as PropType<Schema>,
        required: true,
    },
    value: {
        value: null, // 设置为 null 或 undefined 相当于 any
        required: true,
    },
    onChange: {
        type: Function as PropType<(value: any) => void>,
        required: true,
    },
} as const

export const FieldPropsDefine = {
    schema: {
        type: Object as PropType<Schema>,
        required: true,
    },
    rootSchema: {
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

///////////////////////////////////////////////////////////////////////////////////

const CommonWidgetPropsDefine = {
    // 每个 widget 通用的 props
    value: {
        type: Object as PropType<any>,
    },
    onChange: {
        type: Function as PropType<(v: any) => void>,
        required: true,
    },
} as const

export const SelectWeightPropsDefine = {
    ...CommonWidgetPropsDefine,
    options: {
        type: Array as PropType<
            {
                value: string
                info: any
            }[]
        >,
        required: true,
    },
} as const

export const NumberWidgetPropsDefine = { ...CommonWidgetPropsDefine } as const
export const TextWidgetPropsDefine = { ...CommonWidgetPropsDefine } as const

// TODO: 为什么这样定义的类型会和 SelectionWidget 组件中导出的类型不相同，使用的明明都是同一个 props
export type SelectWeightDefine = DefineComponent<typeof SelectWeightPropsDefine>
export type NumberWidgetDefine = DefineComponent<typeof CommonWidgetPropsDefine>
export type TextWidgetDefine = DefineComponent<typeof CommonWidgetPropsDefine>

export enum SelectionWidgetName {
    SelectionWidget = 'SelectionWidget',
}
export enum CommonWidgetName {
    TextWidgetName = 'TextWidget',
    NumberWidgetName = 'NumberWidget',
}

// 声明主题的接口。也就是定义主题时，它导出的 theme 应该符合该接口的定义
export interface Theme {
    witgets: {
        // witgets 表示小部件/叶子组件，这些就是用户可自定义的主题。我们只负责声明接口，不负责具体组件的实现。当然，我们会提供默认主题。
        [SelectionWidgetName.SelectionWidget]: SelectWeightDefine
        [CommonWidgetName.NumberWidgetName]: NumberWidgetDefine
        [CommonWidgetName.TextWidgetName]: TextWidgetDefine
    }
}
