<template>
  <div class="">
    <ul class="space-y-6">
      <li v-for="post in postFeed" :key="post._id">
        <div class="card-post">
          <img
            v-if="post.file.mimetype.split('/')[0] === 'image'"
            :src="post.file.url"
            width="100%"
          />
          <video v-else :src="post.file.url" controls>
          </video>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
// import SvgExample from "@/assets/svgs/svg-example.svg";

export default {
  name: "TimelineHomepage",
  /*components: {
    SvgExample
  }*/
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
      .catch(() => {
        // catch unauthenticated error logging out user
        console.log('error while fetch post feed');
      });
  },
};
</script>
<style lang="scss">
.homepage {
  max-height: 80vh;
}
</style>
