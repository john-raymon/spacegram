<template>
  <div @submit.prevent="handleSubmit" class="set-subscription-price w-full">
    <h1 class="text-white my-6">
      Subscription price
    </h1>
    <form class="space-y-6" @submit.prevent>
      <div class="flex flex-col text-white">
        <label class="text-md" for="sub-price">Subscription price amount:</label>
        <money
          class="outline-none text-white text-6xl md:text-8xl bg-transparent appearance-none"
          name="subscription-price"
          v-bind="money"
          id="sub-price"
          v-model="subPrice"
        />
        <span>(USD)</span>
      </div>
      <button :disabled="loading" class="base-button">
        Save your price
      </button>
    </form>
  </div>
</template>
<script>
import { Money } from "v-money";

export default {
  name: "SubscriptionPrice",
  components: {
    Money
  },
  data() {
    return {
      subPrice: "0",
      money: {
        prefix: "$",
        suffix: "",
        precision: 2,
        masked: false /* doesn't work with directive */
      },
      loading: false
    };
  },
  methods: {
    handleSubmit() {
      this.loading = true;
      if (this.subPrice < 0.75) {
        this.loading = false;
        return alert("Your subscription price must be at least 0.75 cents.");
      }
      this.loading = false;

      // this.$http
      //   ._patch("/users", {
      //     currentPassword: this.currentPassword,
      //     password: this.newPassword
      //   })
      //   .then(res => {
      //     if (!res.success) {
      //       return alert(
      //         res.message || "Sorry, we weren't able to save your changes at this time."
      //       );
      //     }
      //     this.currentPassword = "";
      //     this.newPassword = "";
      //     this.confirmNewPassword = "";
      //     return alert("Your changes have been saved!");
      //   })
      //   .catch(res => {
      //     return alert(
      //       res.response &&
      //         res.response.data &&
      //         (res.response.data.message ||
      //           "Sorry, we weren't able to save your changes at this time.")
      //     );
      //   })
      //   .finally(() => {
      //     this.loading = false;
      //   });
    }
  }
};
</script>
