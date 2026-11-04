---
name: dual-frontend-vue3
description: Frontend architectural guidelines for the dual Vue 3 Single Page Applications (user-web and admin-web) in CT449. Use when creating or editing Vue components, Pinia stores, router configurations, forms, or Bootstrap styles.
---

# Dual Frontend Vue 3 Architecture (CT449)

The frontend consists of two completely decoupled SPAs under the `frontend/` directory.

---

## 1. Application Separation & Boundaries

| Phân hệ | Thư mục | Dev Port | Prod Port | API Prefix | Phạm vi chức năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Web** | `frontend/user-web` | `5173` | `80` | `/api/user/*` | Tra cứu sách, tìm kiếm giọng nói, đăng ký mượn, gia hạn, Google OAuth, đánh giá |
| **Admin Web** | `frontend/admin-web` | `5174` | `8080` | `/api/admin/*` | Quản lý kho sách, duyệt mượn/trả, quản lý độc giả/nhân viên, biểu đồ Chart.js |

**Strict Isolation:**
- Do not mix components or store logic between `user-web` and `admin-web`.
- `user-web` must NEVER import or call admin API endpoints.
- `admin-web` authentication token must be handled via its own store and local storage key.

---

## 2. Component & Code Standards

1. **Vue 3 Composition API**:
   - Always use `<script setup>` syntax.
   - Example:
     ```vue
     <script setup>
     import { ref, onMounted } from 'vue';
     import { useBookStore } from '@/stores/book';

     const bookStore = useBookStore();
     const loading = ref(false);

     onMounted(async () => {
       loading.value = true;
       await bookStore.fetchBooks();
       loading.value = false;
     });
     </script>

     <template>
       <div class="container py-4">
         <div v-if="loading" class="spinner-border text-primary" role="status"></div>
         <div v-else class="row g-3">
           <!-- Books list -->
         </div>
       </div>
     </template>
     ```

2. **Styling & UI Library**:
   - Use **Bootstrap 5.3** and **FontAwesome**.
   - Do NOT install or introduce TailwindCSS, Vuetify, or other UI libraries.

3. **Form Handling & Validation**:
   - Use **Vee-Validate** and **Yup** for schema validation.
   - Match existing form styling with Bootstrap's `.form-control`, `.invalid-feedback`, etc.

4. **State Management**:
   - Use **Pinia** for centralized reactive state.
   - Keep API calls inside Pinia store actions or dedicated service classes in `src/services/`.

