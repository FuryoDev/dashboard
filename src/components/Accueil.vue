<template>
  <div class="hello">
    accueil de l'application
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'accueil',
  props: {
    msg: String,
  },
  setup() {
    return {}
  },
})
</script>

<style>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
