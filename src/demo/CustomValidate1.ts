export default {
    name: '自定义校验 Demo',
    schema: {
        describe: '年龄不能小于 18',
        type: 'object',
        properties: {
            age: { title: '年龄', type: 'number' },
            name: { title: '姓名', type: 'string' },
            foo: {
                title: 'foo',
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
    },
    customValidate(formData: any, errorsTip: any) {
        if (formData.age < 18) {
            errorsTip.age.addError('年龄过小')
        }
        const fooLen = formData.foo.length
        for (let i = 0; i < fooLen; i++) {
            if (formData.foo[i]?.length > 3) {
                errorsTip.foo[i].addError(`长度过长`)
            }
        }
    },
    uiSchema: {},
    default: {
        age: 12,
        name: 'ABC',
        foo: ['abcd', 'hahaha'],
    },
}
