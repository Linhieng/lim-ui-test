<template>
    <input type="text" :value="props.value" @input="handleChange" />
</template>

<script lang="ts" setup="props">
/*global defineProps*/
import { FieldPropsDefine } from '../types'

const props = defineProps(FieldPropsDefine)

const handleChange = (e) => {
    props.onChange(e.target.value)
}
</script>
