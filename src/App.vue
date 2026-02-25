<template>
  <div id="app">
    <div class="text-white small-text username-display">
      <b-icon icon="person-fill"></b-icon> {{ name }}
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import axios from 'axios'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'app',
  setup() {
    const store = useStore()
    const name = ref('')
    let userInterval = null

    const getUser = () => {
      axios
        .get(store.getters.getUrlBaseService + 'notification/service/user')
        .then((result) => {
          name.value = result.data.firstname + ' ' + result.data.lastname
          store.commit('setUser', result.data)
        })
        .catch((error) => {
          console.error(error)
        })
    }

    onMounted(() => {
      getUser()
      userInterval = setInterval(() => {
        getUser()
      }, 50 * 60 * 1000)
    })

    onUnmounted(() => {
      if (userInterval) {
        clearInterval(userInterval)
      }
    })

    return {
      name,
    }
  },
})
</script>

<style>
#app {
}
html,
body {
}

.min-100 {
}
.container {
  position: relative;
  height: 100vh;
  width: 100vw;
}
.username-display {
  position: absolute;
  top: 1px;
  right: 15px;
  padding: 5px;
  border-radius: 5px;
  font-weight: bold;
}
</style>
