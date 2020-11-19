<template>
  <div @submit.prevent="handleSubmit" class="w-full">
    <h1 class="text-white my-6">
      Update your account information
    </h1>
    <form class="space-y-6">
      <div class="flex items-center flex-row flex-wrap justify-start">
        <div class="relative w-32 h-auto rounded-full mb-2 mr-4">
          <div class="relative w-full padding-bottom-full rounded-full overflow-hidden">
            <img v-if="profileImage" class="absolute w-full h-full object-cover" :src="profileImage" />
            <span v-else class="absolute uppercase flex items-center justify-center w-full h-full text-black bg-red-100">
              {{ userAuth.user.username[0] }}
              {{ userAuth.user.username[1] }}
            </span>
          </div>
        </div>
        <button class="relative base-button w-auto text-sm border text-white focus:text-black hover:text-black bg-transparent">
          <input @change="handleFileChange" class="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer" type="file" name="avatar" accept="image/*" />
          Change profile picture
        </button>
      </div>
      <div>
        <input
          id="email-address"
          type="email"
          class="text-lg text-white bg-transparent border-b w-full focus:outline-none focus:border-b-2"
          name="email-address"
          placeholder="Email Address"
          v-model="email"
        />
        <label class="text-gray-500 text-sm" for="email-address">
          email
        </label>
      </div>
      <div>
        <input
          id="username"
          type="text"
          class="text-white text-lg bg-transparent border-b w-full focus:outline-none focus:border-b-2"
          name="username"
          placeholder="Username"
          v-model="username"
        />
        <label class="text-gray-500 text-sm" for="username">
          username
        </label>
      </div>
      <button :disabled="loading" class="base-button w-full">
        Save your settings
      </button>
    </form>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import imageCompression from 'browser-image-compression';

export default {
  name: 'UpdateAccountInformation',
  data() {
    return {
      email: '',
      username: '',
      profileImage: '',
      file: null,
      loading: false,
    };
  },
  computed: {
    ...mapState(["userAuth"]),
  },
  watch: {
    userAuth: {
      handler() {
        this.email = this.userAuth.user.email;
        this.username = this.userAuth.user.username;
        this.profileImage = this.userAuth.user.imageFile && this.userAuth.user.imageFile.url;
      },
      immediate: true,
    }
  },
  methods: {
    ...mapActions(["updateUserAuth"]),
    handleFileChange(e) {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        this.file = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    handleSubmit() {
      this.loading = true;
      let axiosPatch = undefined;
      if (this.file) {
        axiosPatch = () => {
          // compress file
          const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 1920,
          }
          return imageCompression(this.file, options).then((file) => {
            debugger;
            const formData = new FormData();
            formData.append('user-image', file);
            formData.append('username', this.username || undefined);
            formData.append('email', this.email || undefined);
            return this.$http._patch('/users', formData, null, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          })
        }
      } else {
        axiosPatch = () => this.$http._patch('/users', {
          email: (this.email || undefined),
          username: (this.username || undefined),
        });
      }
      axiosPatch()
        .then((res) => {
          if (!res.success) {
            return alert(res.message || 'Sorry, we weren\'t able to save your changes at this time.');
          }
          this.email = res.user.email;
          this.username = res.user.username;
          this.updateUserAuth({
            isAuth: true,
            user: res.user
          });
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
