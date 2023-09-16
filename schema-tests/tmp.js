const Ajv = require('ajv')

const schema = {
    description: 'A simple form example.',
    type: "array",
    items: [
        // 第一种 ArrayField 类型，多类型数组
        {
            type: 'array',
            items: [
                { type: 'string' },
                { type: 'number' }
            ],
        },
        // 第二种 ArrayField 类型，单类型数组
        {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        // 第三种  ArrayField 类型，多选数组
        {
            type: 'array',
            items: {
                type: 'string',
                enum: ['red', 'green', 'blue'],
            },
        }
    ]
}
const data = [[123, '123'], ['123', 123], ['a']]

try {
    const validator = new Ajv({allErrors: true})
    if (!validator.validate(schema, data)) {
        console.log(validator.errors);
    }
} catch (error) {
    console.error(error.message);
}

