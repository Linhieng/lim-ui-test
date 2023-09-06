import { mount } from '@vue/test-utils'

import JsonSchemaForm, { NumberField, StringField } from '../../lib'

describe('测试 ObjectField', () => {
    it('should render properties to correct fields', async () => {
        let value = {}
        const wrapper = mount(JsonSchemaForm, {
            props: {
                schema: {
                    type: 'Object',
                    properties: {
                        userName: {
                            type: 'string',
                        },
                        age: {
                            type: 'number',
                        },
                    },
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })

        // 📚 我们并不在乎 ObjectField 是否成功渲染，只在乎 properties 是否正确渲染出来
        const numField = wrapper.findComponent(NumberField)
        const strField = wrapper.findComponent(StringField)
        expect(numField.exists()).toBeTruthy()
        expect(strField.exists()).toBeTruthy()
    })

    it('should change value when sub fields trigger onChange', async () => {
        let value: { userName?: string; age?: number } = {}
        const wrapper = mount(JsonSchemaForm, {
            props: {
                schema: {
                    type: 'Object',
                    properties: {
                        userName: {
                            type: 'string',
                        },
                        age: {
                            type: 'number',
                        },
                    },
                },
                value: undefined,
                onChange: (v) => {
                    value = v
                },
            },
        })

        // 这里是为了测试 ObjectField 中的 handleObjectFieldChange 函数，
        // 所以我们并不关心子组件怎么样，只关心子组件的值变化时，是否会触发 ObjectField 中的 handleObjectFieldChange 函数
        const numField = wrapper.findComponent(NumberField)
        const strField = wrapper.findComponent(StringField)

        const strInput = strField.find('input')
        strInput.element.value = 'Alan'
        strInput.trigger('input')
        expect(value.userName).toBe('Alan')

        const numInput = numField.find('input')
        numInput.element.value = '21'
        numInput.trigger('input')
        expect(value.age).toBe(21)

        // 📚 注意 props 的操作是异步的，记得添加 await
        await strField.props('onChange')(undefined)
        expect(value.userName).toBeUndefined()
        await strField.props('onChange')('John')
        expect(value.userName).toBe('John')
        // await numField.props('onChange')(undefined)
        // expect(value.age).toBeUndefined()
    })

    it('properties 为 undefined 的情况', async () => {
        const wrapper = mount(JsonSchemaForm, {
            props: {
                schema: {
                    type: 'Object',
                    properties: undefined,
                },
                value: undefined,
                onChange: (v) => {
                    console.log(v)
                },
            },
        })
        const strField = wrapper.findComponent(StringField)
        expect(strField.exists()).toBeFalsy()
    })
})
