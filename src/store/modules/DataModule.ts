import store from "@/store";
import { Module, VuexModule, Mutation, Action, MutationAction } from "vuex-module-decorators";

@Module({ dynamic: true, store, name: "dataModule" })
export default class MyModule extends VuexModule {
  test: string = "xd";

  get getTest() {
    return this.test;
  }

  @MutationAction
  async fetchTest() {
    const fetched = "aaa";

    return { test: fetched };
  }
}
