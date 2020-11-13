<template>
  <div class="flex flex-col mx-auto text-white w-full px-6 py-4">
    <p class="text-6xl text-red-100 leading-none font-bold text-center">
      {{ subscribers.length }}
      <span class="text-xs text-center block font-light">
        Subscribers
      </span>
    </p>
    <ul class="inline-flex flex-col space-y-2 w-auto mx-auto mt-6">
      <li v-for="subscriber in subscribers" :key="subscriber.subscriber._id">
        <router-link
          :to="`/creator/${subscriber.subscriber._id}`"
          class="flex hover:opacity:75 focus:opacity-50 items-center text-black w-full p-1"
        >
          <div
            class="capitalize text-xs hover:opacity-75 font-black block flex items-center justify-center my-3 p-2 bg-red-200 cursor-pointer rounded-full w-12 h-12"
          >
            {{ subscriber.subscriber.username[0] }}
            {{ subscriber.subscriber.username[1] }}
          </div>
          <p class="text-lg text-white pl-4">
            {{ subscriber.subscriber.username }}
          </p>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SubscribersPage",
  data() {
    return {
      subscribers: []
    };
  },
  created() {
    // fetch followers count
    this.fetchFollowersFollowing();
  },
  methods: {
    fetchFollowersFollowing() {
      // fetch follower count;
      return this.$http
        ._get("/users/followers-following")
        .then(res => {
          this.subscribers = res.followers;
        })
        .catch(() => {
          console.log("error while fetching followers and following");
        });
    }
  }
};
</script>
