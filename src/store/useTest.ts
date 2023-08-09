import { ref } from "vue";
import { defineStore } from "@/pinia/src";

export const useTest = defineStore("test", {
  state() {
    return {
      num: 0
    }
  },
  actions: {
    add() {
      this.num++;
      console.log(this)
    }
  }
})