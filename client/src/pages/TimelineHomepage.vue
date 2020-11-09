<template>
  <div class="pb-6 mx-auto">
    <ul class="space-y-6 max-w-lg">
      <li v-for="post in postFeed" :key="post._id">
        <div class="card-post flex flex-col bg-red-100 rounded-lg">
          <div class="w-100 overflow-hidden rounded-lg bg-black shadow-lg">
            <img
              v-if="post.file.mimetype.split('/')[0] === 'image'"
              :src="post.file.url"
              width="100%"
            />
            <video v-else class="w-100" :src="post.file.url" controls>
            </video>
          </div>
          <div class="flex items-center px-8">
            <p class="mr-2 font-light text-xs">
              Created by
            </p>
            <router-link :to="`/creator/${post.user._id}`" class="capitalize text-xs hover:opacity-75 font-black block flex items-center justify-center my-3 p-2 bg-red-200 cursor-pointer rounded-full w-12 h-12">
              {{ post.user.username[0] }}
              {{ post.user.username[1] }}
            </router-link>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapActions } from "vuex";

export default {
  name: "TimelineHomepage",
  data() {
    return {
      postFeed: [],
    }
  },
  created() {
    // fetch post feed
    this.$http
      ._get("/posts/feed")
      .then((res) => {
        if (res.success) {
          this.postFeed = res.postFeed.filter(p => !p.deleted);
        };
      })
      .catch(function (error) {
        if (error && error.response && error.response.status === 401) {
          this.logout();
        }
        // this.$emit('log-out');
        // catch unauthenticated error logging out user
        console.log('error while fetch post feed');
      }.bind(this));
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>
<style lang="scss">
.homepage {
  max-height: 80vh;
}
</style>
