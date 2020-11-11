<template>
  <form @submit.prevent="testing" class="relative w-full space-y-4 mt-8 px-4">
      <h1 class="text-white">
        Create a new post
      </h1>
      <input
        type="text"
        required="true"
        class="text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
        name="description"
        placeholder="Post caption"
        v-model="postDescription" />
      <file-pond
        name="test"
        required="true"
        label-idle="Click to add a photo or video from your device"
        accepted-file-types="image/*, video/*"
      />
      <button
        class="text-red-800 w-full font-medium text-md bg-white py-3 px-6 outline-none focus:outline-none focus:bg-red-100 hover:bg-red-100 mx-auto rounded-full"
      >
        Post
      </button>
  </form>
</template>
<script>
import vueFilePond from 'vue-filepond';
import MediaIconSvg from '@/assets/svgs/media-icon-svg.svg';
import FilePondPluginMediaPreview from 'filepond-plugin-media-preview';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css';
import 'filepond/dist/filepond.min.css';


  export default {
    name: 'CreatePostPage',
    components: {
      FilePond: vueFilePond(FilePondPluginFileValidateType, FilePondPluginMediaPreview, FilePondPluginImagePreview),
    },
    data() {
      return {
        postDescription: '',
      }
    },
    methods: {
      testing() {
        debugger;
      }
    }
  }
</script>
