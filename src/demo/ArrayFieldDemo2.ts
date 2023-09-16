export default {
    name: '复杂的单类型数组类型',
    schema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { title: '姓名', type: 'string' },
                age: { title: '年龄', type: 'number' },
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
