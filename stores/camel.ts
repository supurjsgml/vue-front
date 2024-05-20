import { camelAPI } from "~/api/camel"
import { defineStore } from 'pinia';

export const camelStore = defineStore("camel", {
  state: (): camelStateType => ({
    data: {
      camelStr: null,
      fileNm: null
    }
  }),
  getters: {

  },
  actions: {
    async genFile() {
      return await camelAPI().getGenFile(this.data);
    }
  }
})
