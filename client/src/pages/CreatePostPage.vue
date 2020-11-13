<template>
  <form @submit.prevent="handleFormSubmit" class="relative w-full space-y-4 mt-8 px-4">
    <h1 class="text-white">
      Create a new post
    </h1>
    <input
      type="text"
      required="true"
      class="text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
      name="description"
      placeholder="Post caption"
      v-model="postDescription"
    />
    <file-pond
      className="cursor-pointer"
      ref="filePond"
      name="test"
      required="true"
      label-idle="Click to add a photo or video from your device"
      accepted-file-types="image/*, video/*"
    />
    <button
      :disabled="loading"
      class="base-button"
    >
      Post
    </button>
  </form>
</template>
<script>
import vueFilePond from "vue-filepond";
import MediaIconSvg from "@/assets/svgs/media-icon-svg.svg";
import FilePondPluginMediaPreview from "filepond-plugin-media-preview";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css";
import "filepond/dist/filepond.min.css";

export default {
  name: "CreatePostPage",
  components: {
    FilePond: vueFilePond(
      FilePondPluginFileValidateType,
      FilePondPluginMediaPreview,
      FilePondPluginImagePreview
    )
  },
  data() {
    return {
      postDescription: "",
      files: [],
      loading: false,
    };
  },
  methods: {
    handleFormSubmit() {
      this.loading = true;
      const { file = undefined } = this.$refs.filePond.getFile();
      if (!file) {
        return alert("Please add media to your post.");
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", this.postDescription)
      // this.$http.axios({
      //   method: 'post',
      //   url: '/api/posts',
      //   data: formData,
      //   config: { headers: { 'Content-Type': 'multipart/form-data' } }
      // })
      this.$http._post('/posts', formData, null, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(function (res) {
          if (res.success) {
            // redirect to post detail page
            return this.$router.push(`/posts/${res.post.id}`);
          }
          // todo fix this, and catch size, file type, and other misc errors that aren't being caught on the client side, and display more descriptive error message
          return alert("We're sorry, we were not able to create your post right now.");
        }.bind(this))
        .catch((err) => {
          alert("We're sorry, we were not able to create your post right now.");
          console.log('Error, while trying to create post', err)
        })
        .finally(() => {
          this.loading = false;
        })
    }
  }
};
</script>
