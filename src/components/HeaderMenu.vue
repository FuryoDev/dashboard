<template>
  <div id="headermenu">
    <b-navbar toggleable="lg" type="dark">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item><router-link to="/dashboard">DashBoard</router-link></b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'headermenu',
  setup() {
    return {}
  },
})
</script>

<style>
</style>
