<template>
    <input type="number" :value="props.value" @input="handleChange" />
</template>

<script lang="ts" setup="props">
/*global defineProps*/
import { FieldPropsDefine } from '../types'

const props = defineProps(FieldPropsDefine)

const handleChange = (e) => {
    const value = e.target.value
    const num = Number(value)
    if (Number.isNaN(num)) {
        props.onChange(undefined)
    } else {
        props.onChange(num)
    }
}
</script>
