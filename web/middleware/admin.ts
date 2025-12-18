import { Middleware } from "@nuxt/types";

const adminMiddleware: Middleware = ({ store, redirect, route }) => {
  const isAdmin = store.getters["auth/isAdmin"];

  if (!isAdmin) {
    return redirect("/");
  }
};

export default adminMiddleware;

