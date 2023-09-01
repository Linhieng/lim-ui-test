import { defineComponent, reactive } from 'vue'
import HelloWorld from './components/HelloWorld'

const img = require('./assets/logo.png') // eslint-disable-line

function renderHelloWorld(age: number) {
    return <HelloWorld age={age} />
}

export default defineComponent({
    setup() {
        const state = reactive({
            name: 'jom',
        })
        return () => (
            <div>
                <img src={img} alt="Vue logo" />
                <p>{state.name}</p>
                {renderHelloWorld(12)}
            </div>
        )
    },
})
