import { FieldPropsDefine } from '../types'
import { defineComponent } from 'vue'

import SchemaItems from '../SchemaItems'

console.log(SchemaItems)

/*
预期收到的 Schema 举例说明：
{
    type: "Object",
    properties: {
        name: {
            type: "string"
        },
        age: {
            type: "number"
        }
    }
}
*/
export default defineComponent({
    name: 'ObjectField',
    props: FieldPropsDefine,
    setup(props) {
        return () => {
            return <div>This is Object Field</div>
        }
    },
})
