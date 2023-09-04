export default {
    name: 'Simple',
    schema: {
        description: '案例描述信息',
        type: 'object',
        required: ['firstName', 'lastName'],
        properties: {
            firstName: {
                type: 'string',
                default: 'Chuck',
            },
            lastName: {
                type: 'string',
            },
            telephone: {
                type: 'string',
                minLength: 10,
            },
        },
    },
    uiSchema: {
        title: 'UI Schema 标题',
        properties: {
            firstName: {
                title: 'First name',
            },
            lastName: {
                title: 'Last name',
            },
            telephone: {
                title: 'Telephone',
            },
        },
    },
    default: {
        firstName: 'Chuck',
        lastName: 'Norris',
        age: 75,
        bio: 'Roundhouse kicking asses since 1940',
        password: '123',
    },
}
