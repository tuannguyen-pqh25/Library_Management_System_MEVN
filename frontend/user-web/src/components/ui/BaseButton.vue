<template>
  <button 
    :class="['btn', computedVariantClass, { 'w-100': block }]" 
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, outline-primary, etc.
  },
  block: {
    type: Boolean,
    default: false
  }
})

const computedVariantClass = computed(() => {
  return `btn-${props.variant}`
})
</script>

<style scoped>
/* Có thể override nhẹ nếu cần thiết cho BaseButton, tuy nhiên phần lớn lấy từ bootstrap override ở style.css */
.btn {
  font-family: var(--font-body);
  font-weight: 500;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: #fff;
}
.btn-primary:hover {
  background-color: #152b21;
  border-color: #152b21;
}
</style>
