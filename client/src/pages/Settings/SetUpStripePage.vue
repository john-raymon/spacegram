<template>
  <div class="w-full">
    <div v-if="stripeAccountConnected" class="w-full">
      <h2 class="text-white mt-6">
        Manage & track your payments/revenue.
      </h2>
    </div>
    <div v-else class="w-full">
      <template v-if="!redirected">
        <h1 class="text-white mt-6">
          Connect a bank/card to receive your payments.
        </h1>
        <p class="py-2 text-white text-sm">
          We use Stripe to payout your revenue from your OnlyInsta.
        </p>
        <button
          :disabled="loading"
          @click="startStripeFlow"
          class="cursor-pointer base-button w-full text-center"
        >
          Click here to securely connect
        </button>
      </template>
      <template v-else>
        <p
          class="py-2 text-white text-xl text-center py-20 my-20 h-40 flex items-center justify-center"
        >
          Setting up your account for payments...
        </p>
      </template>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "SetUpStripePage",
  data() {
    return {
      loading: false,
      redirected: false,
      stripeAccountConnected: false
    };
  },
  watch: {
    $route: {
      handler(val, oldVal) {
        if (val.query.code && val.query.state && !this.userAuth.user.hasConnectedToStripe) {
          this.redirected = true;
          this.continueStripeFlow(val);
        }
        // if redirecting back from stripe, make request to back-end
      },
      immediate: true
    },
    userAuth: {
      handler(val, oldVal) {
        this.stripeAccountConnected = val.user.hasConnectedToStripe;
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(["userAuth"])
  },
  methods: {
    ...mapActions(["updateUserAuth"]),
    continueStripeFlow(route) {
      this.loading = true;
      this.$http
        ._get(route.fullPath)
        .then(res => {
          if (res.success) {
            this.updateUserAuth({
              isAuth: true,
              user: res.user
            });
            alert('You\re all set-up to start getting paid!');
          }
          throw Error(res);
        })
        .catch(err => {
          this.redirected = false;
          console.log("There was an error setting up your stripe account", err);
          alert("We aren't able to set-up your Stripe account right now.");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // make request to get stripe oauth
    startStripeFlow() {
      this.loading = true;
      this.$http
        ._post("/users/stripe/oauth")
        .then(res => {
          if (!res.success) {
            throw "Sorry, we're not able to set-up your pay-out information right now.";
          }
          window.location.href = res.redirectUrl;
        })
        .catch(error => {
          alert(error);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>
