/* eslint-disable @typescript-eslint/ban-ts-comment */
import Ajv from 'ajv'
// @ts-ignore
import i18n from 'ajv-i18n'
import { Schema } from './types'
// @ts-ignore
import toPath from 'lodash.topath'
import { hasOwnProperty, setOwnProperty } from './utils'

export type ErrorSchema = {
    [level: string]: ErrorSchema
} & {
    __errors?: string[]
}

export interface ValidateResult {
    valid: boolean // 校验结果
    errors: Ajv.ErrorObject[] | [] // Ajv 返回的校验结果
    errorSchema: ErrorSchema // 根据 schema 的格式，在校验出错的层级上添加 __error 属性。
    validationError?: string // 如果 schema 格式错误，则会校验出错。
}

/**
 * 根据 errors 中的 dataPath 值，将对应的报错 message 添加到对应层级的 __errors 属性上。
 * 比如：".properties['level1a'].type" --> errorSchema.properties.level1a.type = [messages]
 * @param {Ajv.ErrorObject[] } errors
 * @returns
 */
function toErrorSchema(errors: Ajv.ErrorObject[]): ErrorSchema {
    if (errors.length < 1) {
        return {}
    }
    const errorSchema = {}
    errors.map(({ dataPath, message }) => {
        if (!message) {
            return
        }
        /*
            有关 dataPath 需要说明一下。
            如果是表单值校验出错，则 dataPath 路径是表单值结构的路径。
            如果是 schema 校验出错，则 dataPath 路径是 schema 结构的路径。
            比如下面 schema 结构：
                {
                    "type": "object",
                    "properties": {
                        "level1": {
                            "type": "String"
                        }
                    }
                }
                由于 schema 的 type 写成了 String
                所以 schema 校验出错，dataPath 路径会是 ".properties['level1a'].type"
                提示类型应该是 "array"、"boolean" 、"integer" 、"null" 、"number" 、"object" 、"string" 之一
            当修改 String 为 string 后
            如果对应的表单值是：
                {
                    "level1a": 123,
                }
                此时就会提示表单值校验出错
                对应的 dataPath 会是 ".level1a" 这才是我们在组件中会传递下去的值。
        */
        const path = toPath(dataPath)
        if (path.length > 0 && path[0] === '') {
            path.shift()
        }
        // debugger
        const dataLevel = path.reduce((obj: any, segment: string) => {
            if (!hasOwnProperty(obj, segment)) {
                setOwnProperty(obj, segment, {})
            }
            return obj[segment]
        }, errorSchema)

        if (Array.isArray(dataLevel.__errors)) {
            dataLevel.__errors.push(message)
        } else {
            setOwnProperty(dataLevel, '__errors', [message])
        }
    })

    return errorSchema
}

/**
 * 根据 schema 的定义，对表单数据进行校验
 * @param validator 配置好的 Ajv 校验器
 * @param formData 待校验的数据
 * @param schema 定义的 schema
 * @param locale 语言，默认 zh
 * @returns {ValidateResult} 返回一个校验结果对象
 */
export default function validateFormData(
    validator: Ajv.Ajv,
    formData: any,
    schema: Schema,
    locale = 'zh'
): ValidateResult {
    let validationError
    let valid = false
    try {
        valid = validator.validate(schema, formData) as boolean
    } catch (error) {
        validationError = (error as Error).message
    }

    i18n[locale](validator.errors)
    const errors = validator.errors || []
    const errorSchema = toErrorSchema(errors)

    return {
        valid,
        errors,
        errorSchema,
        validationError,
    }
}
