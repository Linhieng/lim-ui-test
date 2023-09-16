export default {
    name: '复杂的单类型数组类型',
    schema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' },
            },
        },
    },
    uiSchema: {},
    default: [
        {
            name: '张三',
            age: 20,
        },
        {
            name: 123,
            age: '20',
        },
    ],
}
