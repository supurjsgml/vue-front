import { getAPI } from "~/api/get"
import { defineStore } from 'pinia';

export const getStore = defineStore("get", {
  state: (): camelStateType => ({
    data: {
    }
  }),
  getters: {

  },
  actions: {
    async getAlive() {
      return await getAPI().getAlive();
    }
  }
})
