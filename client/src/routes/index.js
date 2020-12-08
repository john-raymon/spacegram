import VueRouter from "vue-router";
import AuthPage from "@/pages/AuthPage";
import TimelineHomepage from "@/pages/TimelineHomepage";
import SignInPage from "@/pages/SignInPage";
import CreatorProfilePage from "@/pages/CreatorProfilePage";
import PostDetailPage from "@/pages/PostDetailPage";
import SubscribersPage from "@/pages/SubscribersPage";
import FollowingPage from "@/pages/FollowingPage";
import CreatePostPage from "@/pages/CreatePostPage";
import SettingsPage from "@/pages/SettingsPage";
import ChangePasswordPage from "@/pages/Settings/ChangePasswordPage";
import UpdateAccountInformation from "@/pages/Settings/UpdateAccountInformation";
import SetUpStripePage from "@/pages/Settings/SetUpStripePage";
import SetSubscriptionPricePage from '@/pages/Settings/SetSubscriptionPricePage';
import store from "@/vuex";

const routes = [
  {
    name: "home",
    path: "/",
    component: SignInPage
  },
  {
    name: "timeline",
    path: "/timeline",
    component: TimelineHomepage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "settings-page",
    path: "/settings",
    component: SettingsPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "set-subscription-price",
    path: "/settings/set-subscription-price",
    component: SetSubscriptionPricePage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "update-your-account-information",
    path: "/settings/account",
    component: UpdateAccountInformation,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "change-password-page",
    path: "/settings/password",
    component: ChangePasswordPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "set-up-stripe",
    path: "/settings/pay",
    alias: ["/users/stripe/token", "/users/stripe/token/dashboard", "/dashboard"],
    component: SetUpStripePage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "create-post",
    path: "/post/new/",
    component: CreatePostPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "following-list",
    path: "/following",
    component: FollowingPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "subscribers-list",
    path: "/subscribers",
    component: SubscribersPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "post-detail",
    path: "/post/:id",
    alias: "/posts/:id",
    component: PostDetailPage,
    meta: {
      requireUserAuth: true
    }
  },
  {
    name: "sign-up",
    path: "/sign-up",
    component: AuthPage
  },
  {
    name: "sign-in",
    path: "/sign-in",
    component: SignInPage
  },
  {
    name: "creator-profile",
    path: "/creator/:id",
    alias: "/:id",
    component: CreatorProfilePage,
  },
];

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  mode: "history"
});

router.beforeEach(async (to, from, next) => {
  const isUserAuth = store.state.userAuth.isAuth;
  if (to.name === "home" && isUserAuth) {
    // when logged in, redirect to timeline-homepage, not sign-in/sign-up homepage
    return next({
      name: "timeline"
    });
  }
  if (to.matched.some(record => record.meta.requireUserAuth)) {
    // this route requires user auth, check if logged in
    // if not, redirect to register/login page.
    if (!isUserAuth) {
      return next({
        name: "sign-in",
        query: { ...to.query, redirect: to.name, redirectParams: JSON.stringify(to.params) }
      });
    } else {
      return next();
    }
  } else {
    return next(); // make sure to always call next()!
  }
});

export default router;
