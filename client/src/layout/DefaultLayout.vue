<template>
  <div class="default-layout">
    <nav class="transparent-background-shadow sticky top-0 w-full text-white z-50 px-6">
      <div class="flex items-center px-4 py-10 max-w-screen-lg mx-auto">
        <router-link to="/" class="w-48 text-white fill-current">
          <OnlyInstaLogo />
        </router-link>
        <ul class="flex justify-end w-full space-x-4">
          <template v-if="userAuth.isAuth">
            <li>
              <router-link to="/creator/me">
                Profile
              </router-link>
            </li>
            <li>
              <button @click="$emit('log-out')">
                Sign out
              </button>
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
    <div v-if="userAuth.isAuth" class="flex justify-center bottom-0 sticky pb-4 max-w-screen-lg mx-auto">
      <div
        class="flex items-center justify-center px-2 py-2 md:py-2 px-6 bg-white rounded-full text-white shadow-2xl"
      >
        <ul class="flex space-x-4">
          <li class="flex">
            <button
              class="focus:outline-none leading-none flex flex-row items-center justify-center text-black p-1 hover:opacity-50"
            >
              <div class="flex flex-col justify-center items-center text-sm">
                <div class="w-8 h-auto text-gray-800 rounded-lg mb-1">
                  <UploadIcon />
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import OnlyInstaLogo from "@/assets/svgs/onlyinsta-logo-svg.svg";
import UploadIcon from "@/assets/svgs/upload-icon-svg.svg";

export default {
  name: "DefaultLayout",
  props: ["userAuth"],
  components: {
    OnlyInstaLogo,
    UploadIcon,
  }
};
</script>
<style lang="scss">
html,
body {
  @apply bg-gray-100;
}
.default-layout {
  @apply h-full mx-auto w-full;
  background-color: #212121;
  .main {
    @apply flex max-w-screen-lg px-6 mx-auto;
    min-height: calc(100vh - 6.25rem); // 6.25rem is the height of the footer in this layout
  }
}
</style>
