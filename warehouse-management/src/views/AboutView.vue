<template>
  <div class="about">
    <h1>About Warehouse Management</h1>
    <p>This system helps manage warehouse operations including inventory, orders, and logistics.</p>
  
  </div>
</template>

<style scoped>
.about {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

p {
  color: var(--color-text);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
