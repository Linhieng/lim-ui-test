// Node.js require:
const Ajv = require('ajv')
const localize = require('ajv-i18n')

const schema = {
    type: 'object',
    properties: {
        level1a: { type: 'string' },
        level1: {
            type: 'object',
            properties: {
                level2: {
                    type: 'string',
                },
            },
        },
    },
}

const data = {
    level1a: 123,
    level1: {
        level2: 123,
    },
}

try {

    const validate = new Ajv({allErrors: true}).compile()
    const valid = validate.validate(schema, data)
    if (!valid) {
        localize.zh(validate.errors)
        console.log(validate.errors)
    }
} catch (error) {
    console.log(error.message);
}

