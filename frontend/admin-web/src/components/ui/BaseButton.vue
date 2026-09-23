<template>
  <button
    class="btn font-body fw-semibold w-100 transition-smooth d-flex justify-content-center align-items-center"
    :class="computedClass"
    :type="type"
    :disabled="disabled || loading"
    style="padding: 0.75rem 1rem; border-radius: 0.5rem;"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: { type: String, default: 'primary' },
    type: { type: String, default: 'button' },
    disabled: Boolean,
    loading: Boolean
  },
  computed: {
    computedClass() {
      if (this.variant === 'primary') {
        return 'btn-primary shadow-sm';
      }
      return `btn-${this.variant}`;
    }
  }
}
</script>

<style scoped>
.btn-primary {
  background-color: var(--bs-primary) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.25) !important;
}
.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8 !important; /* Xanh đậm hơn */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px 0 rgba(37, 99, 235, 0.3) !important;
}
</style>
