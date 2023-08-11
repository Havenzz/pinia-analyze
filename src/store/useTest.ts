import { ref } from "vue";
import { defineStore } from "@/pinia/src";

export const useTestStore1 = defineStore("test1", {
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

export const useTestStore2 = defineStore({
  id:"test2",
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

export const useTestStore3 = defineStore("test3", () => {
  const num = ref(0);
  const add = () => num.value++
  
  return {
    add,
    num
  }
})