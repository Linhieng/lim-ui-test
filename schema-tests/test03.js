const Ajv = require('ajv')

const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            format: 'email',
            minLength: 10,
            errorMessage: {
                type: '必须是字符串',
                minLength: '长度不能小于10',
                format: '必须是合法的邮箱',
            },
        },
        age: {
            type: 'number',
        },
        pets: {
            type: 'array',
            items: [
                {
                    type: 'string',
                },
                {
                    type: 'number',
                },
            ],
        },
        isWorker: {
            type: 'boolean',
        },
    },
    required: ['name', 'age'],
}

const ajv = new Ajv({ allErrors: true, jsonPointers: true })
require('ajv-errors')(ajv)

const validate = ajv.compile(schema)

const valid = validate({
    name: '123',
    age: 18,
    pets: ['mimi', 12],
    // isWorker: true,
})
if (!valid) {
    console.log(validate.errors)
}
