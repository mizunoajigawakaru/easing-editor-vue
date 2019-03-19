<template>
  <div id="app">
    <h1>Easing Editor</h1>
    <easing-editor v-model="easing"/>
  </div>
</template>

<script>
import EasingEditor from './components/EasingEditor.vue'

export default {
  name: 'app',
  components: {
    EasingEditor,
  },

  data() {
    return {
      easing: [0.4, 0.1, 0.4, 0.8],
    };
  },
}
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box
}

#app {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
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
