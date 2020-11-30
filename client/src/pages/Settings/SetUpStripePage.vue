<template>
  <div class="w-full">
    <div v-if="stripeAccountConnected" class="w-full">
      <div class="flex justify-between flex-wrap">
        <h1 class="text-white mt-6">
          Manage & track your earnings
        </h1>
        <button
          :disabled="loading"
          @click="goToStripeDashboard"
          class="cursor-pointer w-full md:w-1/2 base-button text-sm text-center my-4"
        >
          View your payout balance & history
        </button>
      </div>
      <table class="hidden md:table table-auto w-full text-white text-left mt-6">
        <thead class="text-lg">
          <tr>
            <th>Order date</th>
            <th>Customer ID</th>
            <th>Customer username</th>
            <th>Amount earned</th>
            <th class="text-right">Subscription total</th>
          </tr>
        </thead>
        <tbody class="bg-gray-900">
          <tr v-for="s in subscriptions" :key="s.confirmationCode">
            <td>{{ getformattedExpDate(s.expires) }}</td>
            <td>
              <router-link :to="`/creator/${s.subscriber._id}`">
                {{ s.subscriber._id }}
              </router-link>
            </td>
            <td>
              <router-link :to="`/creator/${s.subscriber._id}`">
                {{ s.subscriber.username }}
              </router-link>
            </td>
            <td>${{ ((s.priceInCents / 100) * 0.8).toFixed(2) }}</td>
            <td class="text-right">${{ (s.priceInCents / 100).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <table class="table md:hidden table-fixed w-full text-white text-left mt-4">
        <thead class="text-xs w-full overflow-scroll space-x-2">
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th class="text-right">Earned</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody class="bg-gray-900 text-xs">
          <tr v-for="s in subscriptions" :key="s.confirmationCode">
            <td class="px-1">{{ getformattedExpDate(s.expires) }}</td>
            <td class="px-1">
              <router-link :to="`/creator/${s.subscriber._id}`">
                {{ s.subscriber.username }}
              </router-link>
            </td>
            <td class="text-right px-1">${{ ((s.priceInCents / 100) * 0.8).toFixed(2) }}</td>
            <td class="text-right px-1">${{ (s.priceInCents / 100).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="w-full">
      <template v-if="!redirected">
        <h1 class="text-white mt-6">
          Connect a bank/card to receive your payments.
        </h1>
        <p class="py-2 text-white text-sm">
          We use Stripe to payout your revenue from your OnlyInsta.
        </p>
        ig
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
      stripeAccountConnected: false,
      subscriptions: []
    };
  },
  watch: {
    stripeAccountConnected: {
      handler(val, oldVal) {
        if (val) {
          // fetch subscriptions
          this.$http
            ._get("/users/subscriptions")
            .then(res => {
              if (res.success) {
                this.subscriptions = res.subscriptions;
              }
            })
            .catch(err => {
              console.log("unable to fetch subscriptions");
            });
        }
      },
      immediate: true
    },
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
            return alert("You\re all set-up to start getting paid!");
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
    },
    /**
     * fetch Stripe login link and open in new tab
     */
    goToStripeDashboard() {
      this.$http
        ._post("/users/stripe/dashboard-link")
        .then(res => {
          if (res.success) {
            window.location.href = res.loginLinkUrl;
          }
        })
        .catch(err => {
          console.log("There was a stripe dashboard error", err);
          alert("Could not connect to Stripe.");
        });
    },
    getformattedExpDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  }
};
</script>
