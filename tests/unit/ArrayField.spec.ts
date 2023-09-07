import { mount } from '@vue/test-utils'

import TestComponent from './utils/TestComponent'
import { NumberField, StringField } from '../../lib'
import SelectionWidget from '../../lib/theme/theme-default/widgets/SelectionWidget'

describe('测试 ObjectField', () => {
    it('should render multi type', async () => {
        let value = [] as any
        const wrapper = mount(TestComponent, {
            props: {
                schema: {
                    type: 'array',
                    items: [
                        {
                            type: 'string',
                        },
                        {
                            type: 'number',
                        },
                    ],
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })

        const numField = wrapper.findComponent(NumberField)
        const strField = wrapper.findComponent(StringField)
        expect(numField.exists()).toBeTruthy()
        expect(strField.exists()).toBeTruthy()
    })

    it('should render single type', async () => {
        let value = ['a', 'b'] as any
        const wrapper = mount(TestComponent, {
            props: {
                schema: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })

        const strs = wrapper.findAllComponents(StringField)
        expect(strs.length).toBe(2)
        expect(strs[0].props('value')).toBe('a')
        expect(strs[1].props('value')).toBe('b')
    })

    it('should render selection widget', async () => {
        let value = ['a', 'b'] as any
        const wrapper = mount(TestComponent, {
            props: {
                schema: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['1', '2'],
                    },
                },
                value,
                onChange: (v) => {
                    value = v
                },
            },
        })

        const select = wrapper.findComponent(SelectionWidget)
        expect(select.exists()).toBeTruthy()
    })
})
