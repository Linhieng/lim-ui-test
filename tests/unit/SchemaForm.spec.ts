import { mount } from '@vue/test-utils'

import JsonSchemaForm, { NumberField, StringField } from '../../lib'

describe('测试 SchemaForm', () => {
    it('应该渲染出一个 NumberField 组件', async () => {
        let value = 'hello'
        const wrapper = mount(JsonSchemaForm, {
            props: {
                schema: {
                    type: 'number',
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })
        // TODO: 是否办法将 numberField 拿到外面声明，然后在 afterAll 中初始化时自动更改对应的类型，这样就能在 it 中获取类型提示？
        const numberField = wrapper.findComponent(NumberField)
        // 📚 这里不在乎 SchemaItems 的实现，只要求最终存在 NumberField 组件
        expect(numberField.exists()).toBeTruthy()

        // 下面这个测试用例不是合格的测试用例，因为这是直接调用了 onChange 函数，但实际上应该是通过 input 表单触发 onChange 函数。因为 input 表单是我们自己实现的，我们需要确保 input 表单元素功能的正确实现
        await numberField.props('onChange')('123')
        expect(value).toBe('123') // 会发现最终的值还是一个字符串。因为前面我们提供的 onChange 是直接 value=v

        // 断言 numberField 组件上存在 input 元素
        const input = numberField.find('input')
        expect(input.exists()).toBeTruthy()
        // 断言 input 元素的 type 属性值为 number 类型
        expect(input.attributes('type')).toBe('number')

        // 模拟修改 input 表单的值，
        input.element.value = '456'
        expect(value).toBe('123')
        // 然后触发了表单的 input 事件
        input.trigger('input')
        expect(value).toBe(456) // 因为我们的 input 表单中实现了类型的转换，所以这里应该是 number 类型
    })

    it('应该渲染出一个 StringField 组件', async () => {
        let value = 'hello'
        const wrapper = mount(JsonSchemaForm, {
            props: {
                schema: {
                    type: 'string',
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })
        const stringField = wrapper.findComponent(StringField)
        expect(stringField.exists()).toBeTruthy()

        await stringField.props('onChange')(123)
        expect(value).toBe(123)

        const input = stringField.find('input')
        expect(input.exists()).toBeTruthy()
        expect(input.attributes('type')).toBe('string')

        input.element.value = '456'
        expect(value).toBe(123)
        input.trigger('input')
        expect(value).toBe('456')
    })
})
