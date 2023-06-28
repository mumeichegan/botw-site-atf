<script setup>
window.addEventListener('touchstart', function(event) {
  event.preventDefault()
}, { passive:false })
</script>

<template>
    <client-only>
      <Nav></Nav>
      <Hero></Hero>
    </client-only>

    <Attribution></Attribution>

</template>