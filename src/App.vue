<template>
  <div id="app">
    <h1>Easing Editor</h1>
    <easing-editor v-model="easing" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import EasingEditor from "./components/EasingEditor.vue";

const easing = ref("cubic-bezier(0.4, 0.1, 0.4, 0.8)");
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

#app {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 28px;
  font-weight: 500;
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  -webkit-user-select: none;
}
</style>
