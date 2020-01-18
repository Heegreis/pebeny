<template>
  <v-container>
    <v-btn color="primary" v-on:click="createWindow">開啟新視窗</v-btn>
    {{msg}}
    {{msg2}}
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { app, protocol, BrowserWindow, ipcRenderer } from 'electron'

export default Vue.extend({
  name: 'FunctionList',
  data(){
    return {
      msg: 'Hello World',
      msg2: 'Hello 123',
    }
  },
  methods: {
    createWindow () {
      ipcRenderer.send('newWindow')
    }
  }
});
</script>