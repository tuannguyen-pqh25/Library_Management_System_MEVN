<template>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* XÓA HẾT CSS CŨ (background-image, #app::before...)
  Chúng ta sẽ chuyển nó vào PublicLayout.
*/
body {
  margin: 0;
  /* (Bạn có thể giữ lại font-family nếu muốn) */
}
</style>