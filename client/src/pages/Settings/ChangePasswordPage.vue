<template>
  <div @submit.prevent="handleSubmit" class="change-password-page w-full">
    <h1 class="text-white my-6">
      Change your password
    </h1>
    <form class="space-y-6">
      <div>
        <input
          type="password"
          required="true"
          class="text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
          name="current-password"
          placeholder="Current password"
          v-model="currentPassword"
        />
        <p class="text-gray-600 text-sm pt-2">
          Forgot your password?
        </p>
      </div>
      <input
        type="password"
        required="true"
        class="text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
        name="new-password"
        placeholder="New password"
        v-model="newPassword"
      />
      <input
        type="password"
        required="true"
        class="text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
        name="confirm-new-password"
        placeholder="Confirm new password"
        v-model="confirmNewPassword"
      />
      <button :disabled="loading" class="base-button">
        Save your settings
      </button>
    </form>
  </div>
</template>
<script>

export default {
  name: 'ChangePasswordPage',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      loading: false,
    };
  },
  methods: {
    handleSubmit() {
      this.loading = true;
      if (this.newPassword !== this.confirmNewPassword) {
        this.loading = false;
        return alert('Your passwords do not match');
      }
      this.$http._patch('/users', {
        currentPassword: this.currentPassword,
        password: this.newPassword,
      })
        .then((res) => {
          if (!res.success) {
            return alert(res.message || 'Sorry, we weren\'t able to save your changes at this time.');
          }
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          return alert('Your changes have been saved!')
        })
        .catch((res) => {
          return alert(res.response && res.response.data && (res.response.data.message || 'Sorry, we weren\'t able to save your changes at this time.'));
        })
        .finally(() => {
          this.loading = false;
        })
    },
  },
}
</script>
