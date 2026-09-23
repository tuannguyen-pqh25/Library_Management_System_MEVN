<template>
  <div class="mb-3">
    <label v-if="label" class="form-label font-body small fw-semibold mb-2" style="color: #374151;">
      {{ label }}
    </label>
    <div class="input-group-custom position-relative">
      <span v-if="icon" class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted-custom">
        <i :class="icon"></i>
      </span>
      <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="form-control font-body"
        :class="{ 'ps-5': icon }"
        style="background-color: #f8fafc; color: #1a202c; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; transition: all 0.2s;"
      />
    </div>
    <div v-if="error" class="text-danger small mt-1 font-body">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    label: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    icon: String,
    modelValue: String,
    error: String
  }
}
</script>

<style scoped>
.form-control:focus {
  background-color: #ffffff !important;
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
  outline: none;
}
.form-control::placeholder {
  color: #9ca3af;
}
</style>
