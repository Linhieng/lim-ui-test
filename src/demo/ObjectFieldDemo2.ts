export default {
    name: 'Object Demo 2',
    schema: {
        type: 'object',
        properties: {
            level1: {
                type: 'object',
                properties: {
                    level2: {
                        type: 'string',
                    },
                },
            },
            level1a: { type: 'String' },
        },
    },
    uiSchema: {},
    default: {
        level1a: 123,
        level1: {
            level2: 123,
        },
    },
}
