<template>
  <dir class="home">
    <router-link to="/function-list">Function List</router-link>
    <HelloWorld />
  </dir>
</template>

<script lang="ts">
import Vue from 'vue';
import HelloWorld from '../components/HelloWorld.vue';

export default Vue.extend({
  name: 'Home',

  components: {
    HelloWorld,
  },
});
</script>
