export default {
    name: 'Object Demo 2',
    schema: {
        type: 'object',
        properties: {
            age: { title: '年龄', type: 'number' },
            name: { title: '姓名', type: 'string' },
            hobby: {
                title: '颜色',
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['red', 'green', 'blue'],
                },
            },
        },
    },
    uiSchema: {},
    default: {
        age: '123',
        name: 123,
        hobby: [[123]],
    },
}
