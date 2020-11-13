<template>
  <div class="pb-6 mx-auto text-white w-full px-4">
    <template v-if="!loading && post">
      <div class="card-post flex flex-col bg-red-100 rounded-lg">
        <div class="w-100 overflow-hidden rounded-lg bg-black shadow-lg">
          <img
            v-if="post.file.mimetype.split('/')[0] === 'image'"
            :src="post.file.url"
            width="100%"
          />
          <video v-else class="w-100" :src="post.file.url" controls></video>
        </div>
        <div class="flex items-center justify-between px-8">
          <p v-if="post.description" class="text-black text-sm pr-4">
            {{
              post.description
            }}
          </p>
          <div class="flex items-center">
            <p class="mr-2 font-light text-black text-xs">
              Created by
            </p>
            <router-link
              :to="`/creator/${creator.id}`"
              class="capitalize text-xs hover:opacity-75 font-black block flex items-center justify-center my-3 p-2 bg-red-200 cursor-pointer rounded-full w-12 h-12"
            >
              {{ post.user.username[0] }}
              {{ post.user.username[1] }}
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: "PostDetailPage",
  data() {
    return {
      loading: null,
      creator: null,
      post: null
    };
  },
  created() {
    // fetch post
    this.fetchPost();
  },
  methods: {
    fetchPost() {
      const postId = this.$route.params.id;
      this.loading = true;
      this.$http
        ._get(`/posts/${postId}`)
        .then(res => {
          if (res.success) {
            this.post = res.post;
            this.creator = res.creator;
          }
        })
        .catch(error => {
          this.$router.push("/");
          console.log("error while fetching post");
        })
        .finally(() => {
          this.loading = false;
        });
      // on error redirect to creator profile
    }
  }
};
</script>
