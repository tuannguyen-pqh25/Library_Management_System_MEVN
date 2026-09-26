<template>
  <div class="card card-surface border-0 h-100">
    <slot name="img-top"></slot>
    <div class="card-body" :class="bodyClass">
      <h5 v-if="title" class="card-title font-display">{{ title }}</h5>
      <h6 v-if="subtitle" class="card-subtitle mb-2 text-muted">{{ subtitle }}</h6>
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer bg-transparent border-top-0">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.card-surface {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -4px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.3s ease;
}
.card-surface:hover {
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
}
.card-title {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>
