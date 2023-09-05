export default {
    name: 'Object Demo',
    schema: {
        description: 'A simple form example.',
        type: 'object',
        required: ['firstName', 'lastName'],
        properties: {
            firstName: {
                type: 'string',
                default: 'John',
            },
            lastName: {
                type: 'string',
            },
            age: {
                type: 'number',
                minLength: 1,
                maxLength: 2,
            },
        },
    },
    uiSchema: {},
    default: {
        firstName: 'Alan',
        lastName: 'Smith',
        age: 20,
    },
}
