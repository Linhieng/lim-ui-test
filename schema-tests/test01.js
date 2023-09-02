// Node.js require:
const Ajv = require('ajv')
const localize = require('ajv-i18n')

const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            format: 'email',
            minLength: 20,
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

const ajv = new Ajv()
const validate = ajv.compile(schema)
const valid = validate({
    name: 'jokcy@xxx.com',
    age: 18,
    pets: ['mimi', 12],
    // isWorker: true,
})
if (!valid) {
    localize.zh(validate.errors)
    console.log(validate.errors)
}
