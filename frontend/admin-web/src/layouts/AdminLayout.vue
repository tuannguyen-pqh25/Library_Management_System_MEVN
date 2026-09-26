<template>
  <div class="d-flex w-100 vh-100 overflow-hidden bg-body">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Wrapper -->
    <div class="flex-grow-1 d-flex flex-column overflow-hidden">
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="flex-grow-1 overflow-auto p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppSidebar from "@/components/AppSidebar.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: "AdminLayout",
  components: {
    AppSidebar,
    AppHeader,
  },
};
</script>

<style scoped>
/* Không cần thêm CSS phức tạp vì Bootstrap Flexbox đã xử lý layout */
main {
  background-color: var(--bs-body-bg);
}
</style>
