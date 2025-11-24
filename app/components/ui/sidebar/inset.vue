<template>
  <main
    data-slot="sidebar-inset"
    relative w-full
    bg-background
    class="md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2"
  >
    <slot />
  </main>
</template>
