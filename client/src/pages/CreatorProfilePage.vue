<template>
  <div class="pb-6 mx-auto text-white w-full px-4">
    <div v-if="creator" class="flex  justify-between items-center py-2 pb-4 mb-4 mx-auto space-x-4">
      <div class="flex items-center flex-wrap md:space-x-4">
        <div class="w-32 h-auto bg-red-200 rounded-full mb-2 mr-2">
          <div class="w-full padding-bottom-full rounded-full bg-red-200"></div>
        </div>
        <p class="text-red-200 text-sm md:text-lg">
          @<span class="capitalize">{{ creator.username }}</span>
        </p>
      </div>
      <div v-if="stats">
        <div class="flex space-x-6 text-red-100 text-sm md:text-lg">
          <router-link to="/subscribers" class="text-6xl leading-none font-bold text-center">
            {{ stats.followers.length }}
            <span class="text-xs text-center block font-light">
              Subscribers
            </span>
          </router-link>
          <router-link to="/following" class="text-6xl leading-none font-bold text-center">
            {{ stats.following.length }}
            <span class="text-xs text-center block font-light">
              Following
            </span>
          </router-link>
        </div>
        <p class="text-xs text-center py-2 opacity-50">
          (only you can see this)
        </p>
      </div>
      <p v-else-if="following && subscription" class="text-red-300 text-sm md:text-lg">
        <template v-if="following && subscription">
          Your subscription for this page expires on
          <span class="capitalize">{{ formattedExpDate }}</span>
        </template>
      </p>
    </div>
    <ul v-if="following" class="flex flex-wrap w-full">
      <li
        class="w-1/2 md:w-1/3 cursor-pointer hover:opacity-75"
        v-for="post in posts"
        :key="post._id"
      >
        <router-link
          :to="`/posts/${post._id}`"
          class="block relative padding-bottom-full overflow-hidden"
        >
          <img
            class="absolute h-full w-full object-cover object-center"
            v-if="post.file.mimetype.split('/')[0] === 'image'"
            :src="post.file.url"
          />
          <img
            v-else
            :src="`${post.file.url.split(/\.(?=[^\.]+$)/)[0]}.jpg`"
            class="absolute h-full w-full object-cover object-center"
          />
          <!-- <video
            v-else
            class="absolute h-full w-full object-cover object-center"
            :src="post.file.url"
            controls
          ></video> -->
        </router-link>
      </li>
    </ul>
    <div v-else class="flex flex-col max-w-screen-md mx-auto">
      <p class="text-white text-3xl text-center mb-2">
        Want to follow {{ creator && creator.username }}'s page?
      </p>
      <!-- Stripe.js handles populating card-element-->
      <div class="p-5 bg-gray-900 rounded-lg mb-4">
        <div id="card-element"></div>
      </div>
      <button
        @click="subscribeToCreator"
        class="text-red-800 font-medium text-md bg-white py-3 px-6 outline-none focus:outline-none focus:bg-red-100 hover:bg-red-100 mx-auto rounded-full"
      >
        Subscribe now for $10/month
      </button>
      <span class="text-xs text-white text-center block my-4 leading-none"
        >(no automatic renewals)</span
      >
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import { loadStripe } from "@stripe/stripe-js";

export default {
  name: "CreatorProfilePage",
  data() {
    return {
      following: false,
      creator: null,
      posts: [],
      subscribeError: "",
      subscription: null,
      stats: null
    };
  },
  // handles setting Stripe.js #card-element when mounted on DOM
  mounted() {
    this.setUpStripeElementCard();
  },
  created() {
    // fetch post feed
    this.fetchPost();
  },
  computed: {
    ...mapState(["userAuth"]),
    formattedExpDate() {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(this.subscription.expires).toLocaleDateString(undefined, options);
    }
  },
  methods: {
    ...mapActions(["logout"]),
    fetchPost() {
      // fetch post feed
      this.$http
        ._get(`/users/${this.$route.params.id}/posts`)
        .then(
          function(res) {
            if (res.success) {
              this.following = true;
              this.creator = res.creator;
              this.subscription = res.subscription;
              this.posts = res.posts.filter(p => !p.deleted);
              // TODO: store this date globally, so that we can reuse the other computed data dervived
              // from this for other views, instead of making the same request against
              // check if logged-in user's creator-profile, if so, fetch follower, following count
              if (this.userAuth.user.id === res.creator.id) {
                // fetch follower count;
                return this.$http._get("/users/followers-following").then(res => {
                  this.stats = {
                    following: res.following,
                    followers: res.followers
                  };
                });
              }
            }
            if (res.creator) {
              this.creator = res.creator;
            }
          }.bind(this)
        )
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            this.logout();
          }
          // catch unauthenticated error logging out user
          console.log("error while fetch post feed");
        });
    },
    subscribeToCreator() {
      this.subscribeError = "";
      this.$stripe
        .createToken(this.$stripeCard)
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          const stripeCardToken = result.token.id;
          const createUserId = this.$route.params.id;
          return this.$http
            ._post(`/users/${createUserId}/subscribe`, { stripeCardToken })
            .then(res => {
              if (res.success) {
                return this.fetchPost();
              }
            });
          // continue and make request to subscribe endpoint
        })
        .catch(error => {
          if (error && error.response && error.response.status === 401) {
            this.logout();
          }
          console.log("there was an error", error);
        });
    },
    // set up Stripe.js card element
    setUpStripeElementCard() {
      loadStripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY).then(stripe => {
        this.$stripe = stripe;
        // Create an instance of Elements
        const elements = stripe.elements();

        // Custom styling can be passed to options when creating an Element.
        // (Note that this demo uses a wider set of styles than the guide below.)
        const style = {
          base: {
            color: "white",
            lineHeight: "18px",
            fontFamily: '"El Messiri"',
            fontSmoothing: "antialiased",
            fontSize: "1.2rem",
            "::placeholder": {
              color: "#aab7c4"
            }
          },
          invalid: {
            color: "#fa755a",
            iconColor: "#fa755a"
          }
        };

        // Create an instance of the card Element
        this.$stripeCard = elements.create("card", { style });

        // Add an instance of the card Element into the `card-element` <div>
        this.$stripeCard.mount("#card-element");
      });
    }
  }
};
</script>
<style lang="scss"></style>
