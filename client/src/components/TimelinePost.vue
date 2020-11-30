<template>
  <div
    v-if="statePost"
    @click="goToPostDetail"
    class="card-post flex flex-col bg-red-100 rounded-lg w-full"
  >
    <div class="w-full overflow-hidden rounded-lg bg-black shadow-lg">
      <img
        v-if="statePost.file.contentType.split('/')[0] === 'image'"
        :src="statePost.url"
        width="100%"
      />
      <div v-else class="w-full h-40 relative">
        <div class="w-full h-full absolute top-0 left-0 flex items-center justify-center">
          <img
            class="absolute h-full w-full object-cover object-center opacity-50"
            :src="statePost.thumbnailUrl"
          />
          <div
            class="absolute left-0 top-0 h-full w-full mx-auto flex flex-col items-center text-white justify-center opacity-75"
          >
            <div class="w-1/6 h-auto fill-current cursor-pointer hover:opacity-50">
              <PlayIconSvg />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between px-3 md:px-8 w-full">
      <div class="flex flex-col w-1/2">
        <div class="flex items-center space-x-1">
          <button
            class="w-8 h-8 text-red-500 fill-current focus:outline-none focus:text-red"
            @click.stop="toggleLike"
          >
            <HeartFilledSvg v-if="hasLiked" />
            <HeartSvg v-else />
          </button>
          <p @click="toggleLikesModal" class="cursor-pointer text-sm text-black items-center">
            {{postLikesText}}
          </p>
        </div>
        <p v-if="statePost.description" class="text-black text-sm pr-4">
          {{ statePost.description }}
        </p>
      </div>
      <div class="w-auto py-2 flex items-center float-right">
        <p class="mr-2 font-light text-black text-xs">
          Created by
        </p>
        <router-link
          :to="`/creator/${post.user.id}`"
          class="relative w-12 h-auto bg-white rounded-full mb-2 mr-2"
        >
          <div
            class="relative w-full padding-bottom-full rounded-full bg-red-200 overflow-hidden"
          >
            <img
              v-if="post.user.imageFile"
              class="absolute w-full h-full object-cover"
              :src="post.user.imageFile.url"
            />
            <span
              v-else
              class="absolute uppercase flex items-center justify-center w-full h-full text-black"
            >
              {{ post.user.username[0] }}
              {{ post.user.username[1] }}
            </span>
          </div>
        </router-link>
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
          <ul class="inline-flex flex-col space-y-2 w-full mx-auto mt-6" v-if="statePost && statePost.likes">
            <li v-for="like in statePost.likes" :key="like._id" class="w-full">
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
  </div>
</template>
<script>
import HeartSvg from "@/assets/svgs/heart-icon-svg.svg";
import HeartFilledSvg from "@/assets/svgs/filled-heart-icon.svg";
import { mapState } from "vuex";
import Modal from "@/components/Modal";
import PlayIconSvg from "@/assets/svgs/play-icon-svg.svg";

export default {
  name: "TimelinePost",
  props: ["post"],
  data() {
    return {
      statePost: null,
      showLikesModal: false,
    }
  },
  watch: {
    post: {
      handler(val, oldVal) {
        this.statePost = val;
      },
      immediate: true,
    },
  },
  components: {
    HeartSvg,
    HeartFilledSvg,
    LikesModal: Modal,
    PlayIconSvg,
  },
  computed: {
    ...mapState(["userAuth"]),
    postLikesText() {
      if (this.statePost && this.statePost.likes) {
        return `${this.statePost.likes.length} like${this.statePost.likes.length === 1 ? "" : "s"}`;
      }
      return '0 likes';
    },
    hasLiked() {
      return (
        this.statePost && this.statePost.likes && this.statePost.likes.find(l => l._id === this.userAuth.user.id)
      );
    }
  },
  methods: {
    goToPostDetail() {
      if (!this.statePost) {
        return;
      }
      this.$router.push(`/posts/${this.statePost._id}`);
    },
    toggleLikesModal() {
      this.showLikesModal = !this.showLikesModal;
    },
    // TODO: move toggleLike like stuff into reusable mixin
    toggleLike(e) {
      e.stopPropagation();
      if (!this.statePost) {
        return;
      }
      const postId = this.statePost._id;
      this.$http
        ._post(`/posts/${postId}/toggle-like`)
        .then(res => {
          if (res.success) {
            this.statePost.likes = res.likes;
          }
        })
        .catch(error => {
          console.log("there was an eror when attempting to toggle the like on this post", error);
        });
      // make request to like post
    },
  },
}
</script>
