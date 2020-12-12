<template>
  <div class="w-full py-6 space-y-8 md:space-y-16">
    <div class="hero-container flex flex-col md:flex-row justify-between items-center">
      <div class="w-full md:w-1/2 md:pr-5">
        <p class="pink-gradient-text-color text-center md:text-left leading-none text-4xl md:text-6xl font-ram tracking-normal">
          START EARNING
          <br/>
          FROM YOUR FANS
          <br/>
          INSTANTLY.
          <span class="block pt-2 md:pt-6 text-white text-2xl md:text-4xl leading-none uppercase">
            with paid subscriptions
          </span>
          <span class="block text-gray-600 text-2xl md:text-4xl leading-none uppercase">
            for your content.
          </span>
        </p>
      </div>
      <div class="py-4 md:p-0 w-full md:w-1/2">
        <img src="@/assets/onlyinsta-profile-image.png" class="w-full px-4 md:pr-0 md:pl-8 h-auto" />
      </div>
    </div>
    <div class="bottom-hero-container flex flex-col md:flex-row justify-between items-center">
      <div class="md:order-last w-full md:w-1/2 md:pl-10">
        <p class="pink-gradient-text-color text-center md:text-right leading-none text-4xl md:text-6xl font-ram tracking-normal">
          ACCEPT TIPS
          <br/>
          FROM
          <br/>
          SUBSCRIBERS.
          <span class="block pt-2 md:pt-6 text-white text-2xl md:text-4xl leading-none uppercase">
            (TIPS & LIVE COMING SOON)
          </span>
        </p>
      </div>
      <div class="py-4 md:p-0 w-full md:w-1/2">
        <img src="@/assets/onlyinsta-post-image.png" class="w-full h-auto px-4 md:pl-0 md:pr-8" />
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: "LandingPage",
}
</script>
