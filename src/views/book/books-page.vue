<template>
  <section class="books-page-layout space">
    <div class="container">
      <div class="title-area text-center animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">Sách</h2>
      </div>

      <!-- Category grid -->
      <Category @category-selected="handleCategorySelected" />

      <!-- Book list filtered by selected category -->
      <BookList :selectedCategory="selectedCategory" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import Category from '@/views/category/category.vue'
import BookList from '@/views/book/book-list.vue'

const selectedCategory = ref(null)

function handleCategorySelected(categoryId) {
  // simply update local ref which is passed to BookList
  selectedCategory.value = categoryId
}
</script>

<style scoped>
.books-page-layout { padding-top: 24px; padding-bottom: 36px; }
.sec-title { margin-bottom: 18px; }
</style>
