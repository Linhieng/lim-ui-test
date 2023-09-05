export default {
    name: 'Array Demo',
    schema: {
        description: 'A simple form example.',
        type: 'array',
        items: [
            {
                type: 'string',
            },
            {
                type: 'array',
                items: { type: 'string' },
            },
            {
                type: 'array',
                items: {
                    type: 'Object',
                    properties: {
                        name: {
                            type: 'string',
                            // TODO: 默认值不生效
                            default: 'John',
                        },
                        age: {
                            type: 'number',
                            default: 20,
                        },
                    },
                },
            },
            {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['red', 'green', 'blue'],
                },
            },
        ],
    },
    uiSchema: {},
    default: [undefined, [''], [{}, { name: 'Alan' }]],
}
