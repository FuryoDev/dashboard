<template>
<div   id="app" >
     <div class= "text-white small-text username-display">
      <b-icon icon="person-fill"></b-icon> {{ name }}
    </div> 
    
 
    <router-view> </router-view>
  </div>
  
</template>

<script>
import axios from "axios";


export default {
  name: "app",
  components: {
    
  },
  data(){
    return{
    name :"",}
  },
  mounted() {
    this.getUser();
    const self = this;
    setInterval(function () {self.getUser() }, 50*60*1000);
  },
  methods: {
    getUser() {
      axios
        .get(this.$store.getters.getUrlBaseService+  "notification/service/user")
        .then((result) => {  
          this.name=result.data.firstname+" "+result.data.lastname 
          this.$store.commit("setUser", result.data);
    })
        
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: #a7bdc4;
  min-height: 100%!important;;
  height: 100%!important;; */
}
html,
body {
  /* height: 100%; */
}

.min-100 {
  /*, min-height: 100%; */
}
.container {
  position: relative;
  height: 100vh; /* Full height of the viewport */
  width: 100vw; /* Full width of the viewport */
}
.username-display {
  position: absolute;
  top: 1px; /* Adjust as needed */
  right: 15px; /* Adjust as needed */
 /* background-color: rgba(255, 255, 255, 0.8);  Optional background for readability */
  padding: 5px; /* Optional padding */
  border-radius: 5px; /* Optional rounded corners */
  font-weight: bold; /* Make text bold */
 
}
</style>
