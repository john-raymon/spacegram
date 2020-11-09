<template>
  <component @log-out="handleLogout" :is="layout" :userAuth="userAuth">
    <router-view :key="$route.fullPath" :userAuth="userAuth" />
  </component>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  computed: {
    layout() {
      return this.$route.meta.layout || "default-layout";
    },
    ...mapState(["userAuth"])
  },
  watch: {
    userAuth(val, oldVal) {
      if (!val.isAuth && val.isAuth !== oldVal.isAuth) {
        return this.$router.push({ name: "home" });
      }
    }
  },
  methods: {
    ...mapActions(["logout"]),
    handleLogout() {
      this.logout();
    }
  }
};
</script>
