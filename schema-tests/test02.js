// Node.js require:
const Ajv = require('ajv')
const localize = require('ajv-i18n')

const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            format: 'email',
            minLength: 10,
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
        foo: {
            type: 'string',
            format: 'testformat',
        },
        bar: {
            type: 'string',
            testkey: true,
        },
    },
    required: ['name', 'age'],
}

const ajv = new Ajv()
ajv.addFormat('testformat', (data) => {
    console.log(data, '------------')
    return data === 'haha'
})
ajv.addKeyword('testkey', {
    macro() {
        return {
            minLength: 10,
        }
    },
    metaSchema: {
        type: 'boolean',
    },
})

const validate = ajv.compile(schema)

const valid = validate({
    name: 'jokcy@xxx.com',
    age: 18,
    pets: ['mimi', 12],
    // isWorker: true,
    foo: 'haha',
    bar: 'abcde12345',
})
if (!valid) {
    localize.zh(validate.errors)
    console.log(validate.errors)
}
