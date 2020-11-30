<template>
  <div class="pb-6 mx-auto text-white w-full px-4">
    <template v-if="!loading && post">
      <div class="card-post flex flex-col bg-red-100 rounded-lg">
        <div class="w-full overflow-hidden rounded-lg bg-black shadow-lg">
          <img
            v-if="post.file.contentType.split('/')[0] === 'image'"
            :src="post.url"
            width="100%"
          />
          <video v-else class="w-full" :src="post.url" controls></video>
        </div>
        <div class="flex items-center justify-between py-2 px-3 md:px-8 w-full">
          <div class="flex flex-col w-1/2">
            <div class="flex items-center space-x-1">
              <button
                class="w-8 h-8 text-red-500 fill-current focus:outline-none focus:text-red"
                @click="toggleLike"
              >
                <HeartFilledSvg v-if="hasLiked" />
                <HeartSvg v-else />
              </button>
              <p @click="toggleLikesModal" class="cursor-pointer text-sm text-black items-center">
                {{postLikesText}}
              </p>
            </div>
            <p v-if="post.description" class="text-black text-sm pr-4">
              {{ post.description }}
            </p>
          </div>
          <div class="py-2 flex items-center">
            <div class="w-auto flex items-center">
              <p class="mr-2 font-light text-black text-xs">
                Created by
              </p>
              <!-- <router-link
                :to="`/creator/${creator.id}`"
                class="capitalize text-xs hover:opacity-75 font-black block flex items-center justify-center my-3 p-2 bg-red-200 cursor-pointer rounded-full w-12 h-12"
              >
                {{ post.user.username[0] }}
                {{ post.user.username[1] }}
              </router-link> -->
              <router-link
                :to="`/creator/${creator.id}`"
                class="relative w-12 h-auto bg-white rounded-full mb-2 mr-2"
              >
                <div
                  class="relative w-full padding-bottom-full rounded-full bg-red-200 overflow-hidden"
                >
                  <img
                    v-if="creator.imageFile"
                    class="absolute w-full h-full object-cover"
                    :src="creator.imageFile.url"
                  />
                  <span
                    v-else
                    class="absolute uppercase flex items-center justify-center w-full h-full text-black"
                  >
                    {{ creator.username[0] }}
                    {{ creator.username[1] }}
                  </span>
                </div>
              </router-link>
            </div>
            <button @click.stop class="w-5 h-5 text-black fill-current">
              <div class="w-5 h-5">
                <EllipsisIconSvg />
              </div>
            </button>
          </div>
        </div>
      </div>
      <LikesModal @close-modal="toggleLikesModal" v-if="showLikesModal">
        <template v-slot:heading>
          <h1 class="text-black">
            Likes
          </h1>
        </template>
        <template v-slot:body>
          <div class="w-full h-40 overflow-y-scroll">
            <ul class="inline-flex flex-col space-y-2 w-full mx-auto mt-6" v-if="post && post.likes">
              <li v-for="like in post.likes" :key="like._id" class="w-full">
                <router-link
                  :to="`/creator/${like._id}`"
                  class="flex hover:opacity:75 focus:opacity-50 items-center text-black w-full p-1"
                >
                  <div
                    class="capitalize text-xs hover:opacity-75 text-left font-black block flex items-center justify-center cursor-pointer rounded-full w-12 h-12"
                  >
                    <div
                      class="relative w-full padding-bottom-full rounded-full bg-red-200 overflow-hidden"
                    >
                      <img
                        v-if="like.imageFile"
                        class="absolute w-12 h-12 object-cover"
                        :src="like.imageFile.url"
                      />
                      <span
                        v-else
                        class="absolute uppercase flex items-center justify-center w-full h-full text-black"
                      >
                        {{ like.username[0] }}
                        {{ like.username[1] }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm capitalize text-black pl-4">
                    {{ like.username }}
                  </p>
                </router-link>
              </li>
            </ul>
          </div>
        </template>
      </LikesModal>
    </template>
  </div>
</template>
<script>
import HeartSvg from "@/assets/svgs/heart-icon-svg.svg";
import HeartFilledSvg from "@/assets/svgs/filled-heart-icon.svg";
import { mapState } from "vuex";
import Modal from "@/components/Modal";
import EllipsisIconSvg from '@/assets/svgs/ellipsis-icon-svg.svg';

export default {
  name: "PostDetailPage",
  data() {
    return {
      loading: null,
      creator: null,
      post: null,
      showLikesModal: false
    };
  },
  components: {
    HeartSvg,
    HeartFilledSvg,
    LikesModal: Modal,
    EllipsisIconSvg,
  },
  computed: {
    ...mapState(["userAuth"]),
    postLikesText() {
      if (this.post && this.post.likes) {
        return `${this.post.likes.length} like${this.post.likes.length === 1 ? "" : "s"}`;
      }
      return '0 likes';
    },
    hasLiked() {
      return (
        this.post && this.post.likes && this.post.likes.find(l => l._id === this.userAuth.user.id)
      );
    }
  },
  created() {
    // fetch post
    this.fetchPost();
  },
  methods: {
    toggleLikesModal() {
      this.showLikesModal = !this.showLikesModal;
    },
    toggleLike() {
      const postId = this.$route.params.id;
      this.$http
        ._post(`/posts/${postId}/toggle-like`)
        .then(res => {
          if (res.success) {
            this.post.likes = res.likes;
          }
        })
        .catch(error => {
          console.log("there was an eror when attempting to toggle the like on this post", error);
        });
      // make request to like post
    },
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
