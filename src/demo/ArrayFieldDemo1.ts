export default {
    name: '简单的数组类型',
    schema: {
        type: 'array',
        items: [
            // 第一种 ArrayField 类型，多类型数组
            {
                type: 'array',
                items: [
                    { title: '姓名', type: 'string' },
                    { title: '年龄', type: 'number' },
                ],
            },
            // 第二种 ArrayField 类型，单类型数组
            {
                type: 'array',
                items: {
                    title: '巴拉巴拉',
                    type: 'string',
                },
            },
            // 第三种  ArrayField 类型，多选数组
            {
                type: 'array',
                title: '颜色',
                items: {
                    type: 'string',
                    enum: ['red', 'green', 'blue'],
                },
            },
        ],
    },
    uiSchema: {},
    default: [[123, '123'], [123, 123], ['a']],
}
