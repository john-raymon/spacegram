<template>
  <div
    @click.self.stop="$emit('close-modal')"
    class="modal-component flex items-center justify-center bg-black h-full w-full top-0 left-0 bottom-0 z-50 opacity-60 fixed bg-opacity-50 px-4"
  >
    <div @click.stop class="rounded-md w-full max-w-md bg-white h-auto shadow-md p-6">
      <div v-if="showHeader" class="header-container flex flex-row justify-between">
        <slot name="heading">
          <p></p>
        </slot>
        <button @click.stop="$emit('close-modal')" class="w-6 h-6 text-black fill-current">
          <CloseIconSvg />
        </button>
      </div>
      <slot name="body">
        <div class="w-full h-40 text-black">
          Nothing here
        </div>
      </slot>
    </div>
  </div>
</template>
<script>
import CloseIconSvg from "@/assets/svgs/close-icon-svg.svg";

export default {
  name: "Modal",
  props: {
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    CloseIconSvg
  },
};
</script>
