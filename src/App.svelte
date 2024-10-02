<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import Counter from "./lib/Counter.svelte";
  import Chat from "./lib/Chat.svelte";
</script>

<main>
  <Chat />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    width: calc(100vh - 30em);
    height: calc(100vh - 10em);
    margin: 0 auto;
    border: 1px solid #ccc;
  }
</style>
