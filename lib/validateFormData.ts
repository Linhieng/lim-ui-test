/* eslint-disable @typescript-eslint/ban-ts-comment */
import Ajv from 'ajv'
// @ts-ignore
import i18n from 'ajv-i18n'
import { Schema } from './types'
// @ts-ignore
import toPath from 'lodash.topath'
import { hasOwnProperty, isObject, setOwnProperty } from './utils'

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
 * 提供给用户，让用户可以方便的在对应属性上添加自定义错误类型说明。
 * 使用方法如下：比如表单值结构如下：
 *  obj: {
 *      name: xxx
 * }
 * 用户添加的方式应该是 obj.name.addError('xxx')
 */
function createErrorProxy(raw = {}) {
    return new Proxy(raw, {
        get(target, property, receiver) {
            if (property === 'addError') {
                return (msg: string) => {
                    if (typeof msg !== 'string') {
                        console.warn(
                            `错误信息只能是一个字符串，而你输入的是${typeof msg}`
                        )
                        return
                    }
                    const __errors = Reflect.get(target, '__errors', receiver)
                    if (__errors && Array.isArray(__errors)) {
                        __errors.push(msg)
                    } else {
                        Reflect.set(target, '__errors', [msg])
                    }
                }
            }
            // 不是调用 addError()，说明是在访问属性，属性永远是对象，如果不是，则帮助创建
            if (Reflect.get(target, property, receiver) === undefined) {
                Reflect.set(target, property, createErrorProxy(), receiver)
            }
            return Reflect.get(target, property, receiver)
        },
    })
}

/**
 * 将 agent 上的所有 __errors 拷贝到 target 上
 * 保证 target 的 __errors 是字符串数组
 * 保证 agent 的 __errors 是字符串数组
 * 保证 target 和 agent 的“根节点”只有 __errors
 */
function mergeErrorSchema(target: any, agent: any) {
    Object.keys(agent).forEach((key) => {
        if (key === '__errors') {
            if (Array.isArray(target[key])) {
                target[key].push(...agent[key])
            } else {
                target[key] = [...agent[key]]
            }
        } else if (isObject(agent[key])) {
            if (!isObject(target[key])) {
                target[key] = {}
            }
            mergeErrorSchema(target[key], agent[key])
        }
    })
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
    locale = 'zh',
    customValidate?: (data: any, errors: any) => void
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

    if (customValidate) {
        /*
        让用户可以让找以下方式自定义类型检测：
            customValidate(formData: any, errorsTip: any) {
                if (formData.age > 18) {
                    errorsTip.age.addError('年龄过小')
                }
            },
        即可以简单的通过 errorsTip.age.addError 添加错误信息到对应的层级上。
        为此我们使用 Proxy 来代理
        TODO: 我们自己也可以这样使用！
        */
        const errorsProxy = createErrorProxy()
        customValidate(formData, errorsProxy)
        mergeErrorSchema(errorSchema, errorsProxy)
    }

    return {
        valid,
        errors,
        errorSchema,
        validationError,
    }
}
