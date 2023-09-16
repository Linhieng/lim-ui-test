export default {
    name: 'Object Demo 2',
    schema: {
        type: 'object',
        properties: {
            age: { type: 'number' },
            name: { type: 'string' },
            hobby: {
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
