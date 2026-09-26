<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label font-body fw-semibold">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  error: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-label {
  color: var(--bs-body-color);
  margin-bottom: 0.5rem;
}
.form-control {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
}
.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.25rem rgba(30, 61, 47, 0.25);
}
</style>
