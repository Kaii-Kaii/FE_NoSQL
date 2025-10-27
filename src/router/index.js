import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/wishlist",
    redirect: "/home/wishlist",
  },
  {
    path: "/home",
    component: () => import("@/views/home/home-layout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/home/home.vue"),
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("@/views/cart/cart.vue"),
      },
      {
        path: "books",
        name: "books",
        // render a page that includes Category + BookList so /home/books shows categories
        component: () => import("@/views/book/books-page.vue"),
      },
      {
        path: "books/:code",
        name: "book-details",
        component: () => import("@/views/book/book-details.vue"),
      },
      {
        path: "wishlist",
        name: "wishlist",
        component: () => import("@/views/wishlist/wishlist.vue"),
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/user/profile.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/auth-switch.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/auth-switch.vue"),
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("@/views/auth/reset-password.vue"),
  }, 
  {
    path: "/admin",
    name: "admin",
    meta: { requiresAdmin: true },
    component: () => import("@/views/admin/admin.vue"),
    children: [
      {
        path: "book",
        name: "admin-book",
        component: () => import("@/views/admin/book/admin-book.vue"),
      },
      {
        path: "order",
        name: "admin-order",
        component: () => import("@/views/admin/order/admin-order.vue"),
      },
      {
        path: "report",
        name: "admin-report",
        component: () => import("@/views/admin/report/admin-report.vue"),
      },
      {
        path: "warehouse",
        name: "admin-warehouse",
        component: () => import("@/views/admin/warehouse/admin-warehouse.vue"),
      },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
  // always scroll to top when navigating pages within the site
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Force to top-left; delay not necessary in history mode
    return { left: 0, top: 0, behavior: 'auto' }
  },
});
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem("user");
  const isAdmin = user ? JSON.parse(user).role === "admin" : false;

  if (to.meta.requiresAdmin && !isAdmin) {
    ElMessage.error("Bạn không có quyền truy cập trang này!");
    next("/");
  } else {
    next();
  }
});
export default router;
