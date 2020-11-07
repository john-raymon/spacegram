<template>
  <div class="default-layout">
    <nav class="sticky top-0 w-full bg-pink-light">
      <div class="flex items-center px-4 py-6 max-w-screen-lg mx-auto">
        <router-link to="/" class="w-48">
            <OnlyInstaLogo />
        </router-link>
        <ul class="flex justify-end w-full space-x-2">
          <template v-if="userAuth.isAuth">
            <li>
              <a href="" @click.prevent="$emit('log-out')">
                Sign out
              </a>
            </li>
          </template>
          <template v-else>
            <li>
              <router-link to="/sign-in">
                Sign in
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </nav>
    <main class="main">
      <slot />
    </main>
    <div v-if="userAuth.isAuth" class="bg-white shadow-2xl w-full py-8 bottom-0 sticky">
      <p> controls go here </p>
      <p> controls go here </p>
      <p> controls go here </p>
      <p> controls go here </p>
    </div>
  </div>
</template>

<script>
import OnlyInstaLogo from "@/assets/svgs/onlyinsta-logo-svg.svg";

export default {
  name: "DefaultLayout",
  props: ['userAuth'],
  components: {
    OnlyInstaLogo,
  },
};
</script>
<style lang="scss">
html,
body {
  @apply bg-gray-100;
}
.default-layout {
  @apply h-full mx-auto bg-gray-100 onlyinsta-background-gradient w-full;
  .main {
    @apply flex max-w-screen-lg px-4 mx-auto;
    min-height: calc(100vh - 6.25rem); // 6.25rem is the height of the footer in this layout
  }
}
</style>
