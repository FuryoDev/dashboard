
<template>
  <div id="headermenu">
  <b-navbar toggleable="lg" type="dark" >
   <!-- <b-navbar-brand href="#"><router-link  to="/"><b-icon class="ml-1" icon="house-fill"></b-icon></router-link></b-navbar-brand>-->
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item ><router-link   to="/dashboard">DashBoard</router-link></b-nav-item>
      <!--  <b-nav-item ><router-link   to="/vodswing">Vod-Swing</router-link></b-nav-item>
        <b-nav-item-dropdown text="External Partners - Monitor" right>
          <b-dropdown-item href="#">Jobs</b-dropdown-item>
          <b-dropdown-item href="#">Auvio</b-dropdown-item>
          <b-dropdown-item href="#">Whaton</b-dropdown-item>
          <b-dropdown-item href="#">References</b-dropdown-item>
        </b-nav-item-dropdown>-->
       
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
</template>

<script>

export default {
  name: 'headermenu',
  components: {
    
  }
}
</script>

<style>

</style>

