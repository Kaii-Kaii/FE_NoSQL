<template>
    <!-- Cart preview moved to header component (use header-card) -->
  <!-- <button class="back-to-top" id="backToTop" aria-label="Back to Top">
    <span class="progress-circle">
      <svg viewBox="0 0 100 100">
        <circle class="bg" cx="50" cy="50" r="40"></circle>
        <circle class="progress" cx="50" cy="50" r="40"></circle>
      </svg>
      <span class="progress-percentage" id="progressPercentage">0%</span>
    </span>
  </button> -->

  <!--==============================
  Hero Area
  ==============================-->
  <section class="hero-layout1" data-wow-delay="0.25s" aria-hidden="true">
    <div class="hero-item" data-bg-src="@/assets/img/bg/hero-bg1.jpg">
      <div class="container position-relative z-index">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6 position-relative">
            <div class="hero-content">
              <h1 class="hero-title wow animate__fadeInUp" data-wow-delay="0.50s">The Most Biggest <span
                  class="underline">Bookstore</span> in the world</h1>
              <p class="hero-text wow animate__fadeInUp" data-wow-delay="0.75s">We deliver books all over the world
                10,000+ books in stock.</p>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-img">
              <img src="@/assets/img/hero/hero-img-1-1.png" alt="hero image">
            </div>
          </div>
        </div>
      </div>
    </div>
    <span class="shape-mockup element1 z-index1  d-xxl-block d-none" data-wow-delay="0.80s"
      style="right: 0px; top: -10px;"><img src="@/assets/img/shapes/hero-shape2.svg" alt="Hero shape"></span>
    <span class="shape-mockup element2 z-index1  d-xxl-block d-none" data-wow-delay="0.80s"
      style="left: 0px; bottom: -10px;"><img src="@/assets/img/shapes/hero-shape3.svg" alt="Hero shape"></span>
    <span class="shape-mockup z-index1 wow animate__fadeInLeft d-xxl-block d-none" data-wow-delay="0.80s"
      style="left: 0px; top: 0px;"><img src="@/assets/img/shapes/hero-shape1.svg" alt="Hero shape"></span>
  </section>
  <!-- Trending Product Start -->
  <!-- <section class="trending-layout1 space">
    <div class="container">
      <div class="title-area2 animation-style1 title-anime">
        <span class="border-line d-xxl-block d-none"></span>
        <h2 class="sec-title title-anime__title">Trending On Ebukz</h2>
      </div>
      <div class="row g-4">
      <div
        class="col-xl-2 col-md-4 col-sm-6"
        v-for="book in books"
        :key="book.MASACH"
      >
    <div class="product-style1">
      <div class="product-img">
  <img :src="getImage(book.URLSACH ?? book.ANHSACH)" :alt="book.TENSACH" />
        <div class="product-btns">
          <button class="icon-btn wishlist" :class="{ active: isWished(book.MASACH) }" @click="toggleWishlist(book)" :title="isWished(book.MASACH) ? 'Bỏ yêu thích' : 'Thêm yêu thích'">
            <i :class="isWished(book.MASACH) ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
          <button class="icon-btn cart" @click="handleAddToCart(book)">
            <i class="fa-solid fa-basket-shopping"></i>
          </button>
        </div>
      </div>
      <div class="product-content text-center mt-2">
        <h5 class="product-title">{{ book.TENSACH }}</h5>
        <p class="price fw-bold text-danger">{{ formatPrice(book.GIATIEN) }}</p>
        <p class="desc small text-muted">{{ book.MOTA }}</p>
      </div>
    </div>
  </div>
 </div>

    </div>
  </section> -->
  <!-- Trending Product End -->
>
  <!-- Offer section End -->
  <!-- Top Categories Start -->
  <section class="categories-layout1 space" data-bg-src="@/assets/img/bg/categorie-bg1.jpg">
    <div class="container">
      <div class="title-area text-center animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">Top 5 Books</h2>
      </div>
      
      <!-- Top 5 Books - Modern Grid -->
      <div class="top-books-grid">
        <div 
          v-for="(book, index) in topBooks" 
          :key="book._id || book.id"
          class="top-book-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="top-book-card-inner">
            <!-- Book Image -->
            <div class="top-book-image-wrapper" @click.prevent="viewTopBook(book)">
              <img 
                :src="book.coverUrl || book.image || '@/assets/img/product/default.jpg'" 
                :alt="book.name"
                class="top-book-image"
              >
              <!-- Quick Actions Overlay -->
              <div class="top-quick-actions">
                <button 
                  class="top-action-btn top-wishlist-btn" 
                  @click.stop="toggleWishlistTopBook(book)" 
                  :class="{ active: isWishedTopBook(book._id || book.id) }" 
                  :title="isWishedTopBook(book._id || book.id) ? 'Bỏ yêu thích' : 'Thêm yêu thích'"
                >
                  <i :class="isWishedTopBook(book._id || book.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <button 
                  class="top-action-btn top-cart-btn" 
                  @click.stop="handleAddToCartTopBook(book)"
                  title="Thêm vào giỏ"
                >
                  <i class="fa-solid fa-basket-shopping"></i>
                </button>
              </div>
            </div>
            
            <!-- Book Info -->
            <div class="top-book-info">
              <!-- Rating & Price Row -->
              <div class="top-info-row">
                <div class="top-book-rating">
                  <i class="fas fa-star"></i>
                  <span>4.5</span>
                </div>
                <div class="top-book-prices">
                  <span class="top-price-current">{{ formatPrice(book.price) }}</span>
                </div>
              </div>
              
              <!-- Author -->
              <div class="top-book-author">
                <i class="fas fa-user-edit"></i>
                {{ book.author || 'Unknown' }}
              </div>
              
              <!-- Title -->
              <h3 class="top-book-title">
                <a href="#" @click.prevent="viewTopBook(book)" :title="book.name">
                  {{ book.name }}
                </a>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mb-50">
        <router-link :to="{ name: 'books' }" class="vs-btn wow animate__flipInX" data-wow-delay="0.40s">Tất Cả</router-link>
      </div>

      <div class="title-area text-center animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">Top Categories</h2>
      </div>

      <div class="book-search-bar">
        <form class="book-search-form" @submit.prevent>
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Tìm sách theo tên, tác giả hoặc mô tả..."
            aria-label="Tìm kiếm sách"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="clear-btn"
            @click="clearSearch"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <i class="fas fa-times"></i>
          </button>
        </form>
        <p v-if="searchQuery" class="search-meta">Đang tìm: <span>{{ searchQuery }}</span></p>
      </div>
      
      <!-- Category Grid Component -->
      <Category @category-selected="handleCategorySelected" />

      <!-- book-list -->
      <BookList :selected-category="selectedCategoryId" :search-query="searchQuery" />
    </div>
  </section>
  <!-- Top Categories End -->
  <!-- Best selling start -->
  <!-- <section class="selling-layout1 space" data-bg-src="@/assets/img/bg/selling-bg.jpg">
    <div class="container">
      <div class="row g-4 gx-40 align-items-center">
        <div class="col-xl-5">
          <div class="selling-content">
            <h2 class="selling-title wow animate__fadeInUp" data-wow-delay="0.20s">Best Seller Author Of The Month</h2>
            <h4 class="author-name wow animate__fadeInUp" data-wow-delay="0.30s">Joseph Martin</h4>
            <span class="published wow animate__fadeInUp" data-wow-delay="0.40s">30+ Published Book</span>
            <p class="selling-text wow animate__fadeInUp" data-wow-delay="0.50s">Lorem ipsum dolor a amet, consectetur
              adipiscing elit, eiusmod tempor incididunt
              ut labore et dolore magna aliqua. Ut eim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum.</p>
            <a class="vs-btn wow animate__flipInX" data-wow-delay="0.60s" href="#">Read More</a>
          </div>
        </div>
        <div class="col-xl-4">
          <div class="selling-img-tag wow animate__fadeInUp" data-wow-delay="0.30s">
            <div class="wow animate__fadeInDownBig" data-wow-delay="0.30s">
              <div class="tag" data-wow-delay="0.30s">
                <img src="@/assets/img/selling/selling-icon.png" alt="selling icon">
                <h4 class="tag-title">no.1 Best Seller Of The Month</h4>
              </div>
            </div>
            <img src="@/assets/img/selling/selling-img.jpg" class="w-100" alt="selling images">
          </div>
        </div>
        <div class="col-xl-3">
          <div class="selling-books">
            <div class="book-item wow animate__fadeInDown" data-wow-delay="0.30s">
              <img src="@/assets/img/selling/book-img1.jpg" alt="book image">
            </div>
            <div class="book-item wow animate__fadeInDown" data-wow-delay="0.40s">
              <img src="@/assets/img/selling/book-img2.jpg" alt="book image">
            </div>
            <div class="book-item wow animate__fadeInUp" data-wow-delay="0.50s">
              <img src="@/assets/img/selling/book-img3.jpg" alt="book image">
            </div>
            <div class="book-item wow animate__fadeInUp" data-wow-delay="0.60s">
              <img src="@/assets/img/selling/book-img4.jpg" alt="book image">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> -->
  
  <!-- Book Of The Month End -->
  <!-- Testimonial Area  -->
  <!-- <section class="vs-testi__layout1 space">
    <div class="container">
      <div class="row g-5">
        <div class="col-xl-5">
          <div class="banner-img">
            <img src="@/assets/img/others/banner1.jpg" alt="banner image">
            <div class="banner-content">
              <span class="sub-title">Best offer</span>
              <h2 class="banner-title">Save Up to $15</h2>
              <a class="vs-btn" href="shop.html">Shop Now</a>
            </div>
          </div>
        </div>
        <div class="col-xl-7">
          <div class="vs-testi__inner">
            <div class="title-area text-left wow animate__fadeInUp title-anime animation-style5" data-wow-delay="0.25s">
              <span class="sec-subtitle  left-shape justify-content-center title-anime__title">Testimonials</span>
              <h2 class="sec-title title-anime__title">What Our Clint’s Feedback And review</h2>
              <p class="sec-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor inc ididunt ut
                labore et dolore magna aliqua.</p>
            </div>
            <div class="vs-testi__items wow animate__fadeInUp" data-wow-delay="0.35s">
              <div class="vs-carousel testi-slider" data-autoplay="true" data-fade="true">
                <div class="vs-testi__style1">
                  <span class="vs-testi__icon"><img src="@/assets/img/icons/quote-icon.svg" alt="icon"></span>
                  <div class="vs-testi__top">
                    <div class="vs-testi__image">
                      <img class="img1" src="@/assets/img/testimonial/testi-1-1.jpg" alt="testimonials">
                    </div>
                    <div class="vs-testi__author">
                      <div class="star-rating">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                      </div>
                      <h3 class="vs-testi__title">rodja hartmann</h3>
                      <span class="vs-testi__desi">Designer, Vecurosoft</span>
                    </div>
                  </div>
                  <div class="vs-testi__content">
                    <p class="vs-testi__text">
                      <span class="text-highlight"><img class="icon" src="@/assets/img/testimonial/testi-icon1.png"
                          alt="icon"> Lorem ipsum dolor sit a met!</span>
                      “ When you work with Los Angeles House Cleaners Refal Agen cleaning room breathe easy because your
                      home will soon When yowork with Angeles House Cleaners Referal Agency cleaning breathe ”
                    </p>
                  </div>
                </div>
                <div class="vs-testi__style1">
                  <span class="vs-testi__icon"><img src="@/assets/img/icons/quote-icon.svg" alt="icon"></span>
                  <div class="vs-testi__top">
                    <div class="vs-testi__image">
                      <img class="img1" src="@/assets/img/testimonial/testi-1-1.jpg" alt="testimonials">
                    </div>
                    <div class="vs-testi__author">
                      <div class="star-rating">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                      </div>
                      <h3 class="vs-testi__title">alaxander pall</h3>
                      <span class="vs-testi__desi">Designer, Vecurosoft</span>
                    </div>
                  </div>
                  <div class="vs-testi__content">
                    <p class="vs-testi__text">
                      <span class="text-highlight"><img class="icon" src="@/assets/img/testimonial/testi-icon1.png"
                          alt="icon"> Lorem ipsum dolor sit a met!</span>
                      “ When you work with Los Angeles House Cleaners Refal Agen cleaning room breathe easy because your
                      home will soon When yowork with Angeles House Cleaners Referal Agency cleaning breathe ”
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="custom-arraw wow animate__fadeInUp" data-wow-delay="0.45s">
              <div class="icon-arraw slick-prev" data-slick-prev=".testi-slider">
                <button class="icon-btn">
                  <i class="fa-regular fa-arrow-right"></i>
                </button>
              </div>
              <div class="icon-arraw slick-next" data-slick-next=".testi-slider">
                <button class="icon-btn">
                  <i class="fa-regular fa-arrow-left"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> -->
  <!-- Testimonial Area End  -->
  <!-- Blog Area Start  -->
  <!-- <section class="custom-space-bottom">
    <div class="container">
      <div class="title-area2 animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">Blog And News</h2>
        <a class="vs-btn wow animate__flipInX" data-wow-delay="0.50s" href="blog.html">View More</a>
      </div>
      <div class="row vs-carousel blog-carousel wow animate__fadeInUp" data-wow-delay="0.25s" data-arrows="true"
        data-autoplay="true" data-slide-show="3" data-lg-slide-show="2" data-md-slide-show="2" data-center-mode="true">
        <div class="col-lg-4 col-md-6">
          <div class="vs-blog blog-style1">
            <div class="blog-img">
              <a href="blog-details.html"><img class="blog-img__img" src="@/assets/img/blog/blog-img-1-1.jpg"
                  alt="Blog Image"></a>
              <div class="blog-date">
                <span class="day"><strong class="month">15</strong>may</span>
              </div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <a href="blog.html"><i class="fa-solid fa-user"></i>By Admin</a>
                <a href="blog.html"><i class="fa-solid fa-comments"></i>2 Comments</a>
              </div>
              <h2 class="blog-title">
                <a href="blog-details.html">Lorem ipsum dolor sit amet consectetur.</a>
              </h2>
              <div class="btn-area">
                <a class="vs-btn" href="blog-details.html">Read More<i class="fa-regular fa-arrow-right"></i></a>
                <div class="social-media">
                  <div class="member-links">
                    <a href="#" tabindex="-1"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" tabindex="-1"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-instagram"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-behance"></i></a>
                  </div>
                  <span class="icon-btn"><i class="fas fa-share-alt"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="vs-blog blog-style1">
            <div class="blog-img">
              <a href="blog-details.html"><img class="blog-img__img" src="@/assets/img/blog/blog-img-1-2.jpg"
                  alt="Blog Image"></a>
              <div class="blog-date">
                <span class="day"><strong class="month">16</strong>may</span>
              </div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <a href="blog.html"><i class="fa-solid fa-user"></i>By Admin</a>
                <a href="blog.html"><i class="fa-solid fa-comments"></i>2 Comments</a>
              </div>
              <h2 class="blog-title">
                <a href="blog-details.html">Lorem ipsum dolor sit amet consectetur.</a>
              </h2>
              <div class="btn-area">
                <a class="vs-btn" href="blog-details.html">Read More<i class="fa-regular fa-arrow-right"></i></a>
                <div class="social-media">
                  <div class="member-links">
                    <a href="#" tabindex="-1"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" tabindex="-1"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-instagram"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-behance"></i></a>
                  </div>
                  <span class="icon-btn"><i class="fas fa-share-alt"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="vs-blog blog-style1">
            <div class="blog-img">
              <a href="blog-details.html"><img class="blog-img__img" src="@/assets/img/blog/blog-img-1-3.jpg"
                  alt="Blog Image"></a>
              <div class="blog-date">
                <span class="day"><strong class="month">16</strong>may</span>
              </div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <a href="blog.html"><i class="fa-solid fa-user"></i>By Admin</a>
                <a href="blog.html"><i class="fa-solid fa-comments"></i>2 Comments</a>
              </div>
              <h2 class="blog-title">
                <a href="blog-details.html">Lorem ipsum dolor sit amet consectetur.</a>
              </h2>
              <div class="btn-area">
                <a class="vs-btn" href="blog-details.html">Read More<i class="fa-regular fa-arrow-right"></i></a>
                <div class="social-media">
                  <div class="member-links">
                    <a href="#" tabindex="-1"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" tabindex="-1"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-instagram"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-behance"></i></a>
                  </div>
                  <span class="icon-btn"><i class="fas fa-share-alt"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="vs-blog blog-style1">
            <div class="blog-img">
              <a href="blog-details.html"><img class="blog-img__img" src="@/assets/img/blog/blog-img-1-4.jpg"
                  alt="Blog Image"></a>
              <div class="blog-date">
                <span class="day"><strong class="month">16</strong>may</span>
              </div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <a href="blog.html"><i class="fa-solid fa-user"></i>By Admin</a>
                <a href="blog.html"><i class="fa-solid fa-comments"></i>2 Comments</a>
              </div>
              <h2 class="blog-title">
                <a href="blog-details.html">Lorem ipsum dolor sit amet consectetur.</a>
              </h2>
              <div class="btn-area">
                <a class="vs-btn" href="blog-details.html">Read More<i class="fa-regular fa-arrow-right"></i></a>
                <div class="social-media">
                  <div class="member-links">
                    <a href="#" tabindex="-1"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" tabindex="-1"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-instagram"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-behance"></i></a>
                  </div>
                  <span class="icon-btn"><i class="fas fa-share-alt"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="vs-blog blog-style1">
            <div class="blog-img">
              <a href="blog-details.html"><img class="blog-img__img" src="@/assets/img/blog/blog-img-1-5.jpg"
                  alt="Blog Image"></a>
              <div class="blog-date">
                <span class="day"><strong class="month">16</strong>may</span>
              </div>
            </div>
            <div class="blog-content">
              <div class="blog-meta">
                <a href="blog.html"><i class="fa-solid fa-user"></i>By Admin</a>
                <a href="blog.html"><i class="fa-solid fa-comments"></i>2 Comments</a>
              </div>
              <h2 class="blog-title">
                <a href="blog-details.html">Lorem ipsum dolor sit amet consectetur.</a>
              </h2>
              <div class="btn-area">
                <a class="vs-btn" href="blog-details.html">Read More<i class="fa-regular fa-arrow-right"></i></a>
                <div class="social-media">
                  <div class="member-links">
                    <a href="#" tabindex="-1"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" tabindex="-1"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-instagram"></i></a>
                    <a href="#" tabindex="-1"><i class="fab fa-behance"></i></a>
                  </div>
                  <span class="icon-btn"><i class="fas fa-share-alt"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section> -->
  <!-- Blog Area End  -->
 
  <!--********************************
			Code End  Here 
	******************************** -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { listBook, getTopBooks, getAllBooks } from "@/api/book";
import { addToCart } from "@/api/cart";
import { getCategory } from "@/api/category";
import { getCart } from "@/api/cart";
import { toggleWishlist as toggleWishlistApi, getWishlistIds } from '@/api/wishlist'
import { on as onEvent, off as offEvent } from '@/utils/eventBus'
import BookList from '../book/book-list.vue'
import Category from '../category/category.vue'
import CategoryBooks from '../category/category-books.vue'
import { ElNotification } from 'element-plus'

const books = ref([]);
const topBooks = ref([]);
const router = useRouter();
const cartPreview = ref([]);
const showCartPreview = ref(false);
const selectedCategoryId = ref(null);
const searchQuery = ref('');
const wishlistIds = ref(getWishlistIds());
const topBooksWishlistIds = ref(new Set());

// Wishlist helpers
function isWished(id) {
  try {
    if (id == null) return false
    return wishlistIds.value.has(String(id))
  } catch (e) { return false }
}
function toggleWishlist(book) {
  const rawId = book.MASACH || book.code || book._id || book.id
  const bookId = rawId != null ? String(rawId) : null
  if (!bookId) {
    console.warn('Không tìm thấy mã sách để cập nhật yêu thích:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để cập nhật yêu thích.', type: 'warning' }) } catch (e) {}
    return
  }
  const wasWished = isWished(bookId)
  toggleWishlistApi({
    MASACH: bookId,
    TENSACH: book.TENSACH,
    GIATIEN: book.GIATIEN,
    URLSACH: book.URLSACH ?? book.ANHSACH,
  })
  wishlistIds.value = getWishlistIds()
  try {
    ElNotification({
      title: 'Success',
      message: wasWished ? `Đã bỏ khỏi yêu thích: ${book.TENSACH}` : `Đã thêm vào yêu thích: ${book.TENSACH}`,
      type: 'success',
    })
  } catch (e) {}
}
// Xử lý khi chọn category - nhận MADANHMUC từ CategoryGrid
function handleCategorySelected(categoryId) {
  console.log('Category selected in home, ID:', categoryId)
  selectedCategoryId.value = categoryId
}

// Xử lý Wishlist cho Top Books
function isWishedTopBook(id) {
  try {
    if (id == null) return false
    return topBooksWishlistIds.value.has(String(id))
  } catch (e) { return false }
}

function toggleWishlistTopBook(book) {
  const rawId = book.code || book._id || book.id
  const bookId = rawId != null ? String(rawId) : null
  if (!bookId) {
    console.warn('Không tìm thấy mã sách (top book) để cập nhật yêu thích:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để cập nhật yêu thích.', type: 'warning' }) } catch (e) {}
    return
  }
  const wasWished = isWishedTopBook(bookId)
  
  // Convert API response to cart format
  toggleWishlistApi({
    MASACH: bookId,
    TENSACH: book.name,
    GIATIEN: book.price,
    URLSACH: book.coverUrl || book.image,
  })
  
  wishlistIds.value = getWishlistIds()
  topBooksWishlistIds.value = getWishlistIds()
  
  try {
    ElNotification({
      title: 'Success',
      message: wasWished ? `Đã bỏ khỏi yêu thích: ${book.name}` : `Đã thêm vào yêu thích: ${book.name}`,
      type: 'success',
    })
  } catch (e) {}
}

// Điều hướng tới trang detail cho top book
function viewTopBook(book) {
  // support multiple possible id fields returned by different APIs
  const rawId = book.MASACH || book.code || book._id || book.id
  const bookCode = rawId != null ? String(rawId) : null
  if (!bookCode) {
    console.warn('Không tìm thấy mã sách (top book) để xem chi tiết:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin chi tiết cho sách này.', type: 'warning' }) } catch (e) {}
    return
  }
  router.push(`/home/books/${bookCode}`)
}

// Thêm top book vào giỏ
function handleAddToCartTopBook(book) {
  const rawId = book.code || book.MASACH || book._id || book.id
  const bookId = rawId != null ? String(rawId) : null
  if (!bookId) {
    console.warn('Không tìm thấy mã sách (top book) để thêm vào giỏ:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để thêm vào giỏ hàng.', type: 'warning' }) } catch (e) {}
    return
  }

  addToCart({
    MASACH: bookId,
    TENSACH: book.name || book.TENSACH,
    GIATIEN: book.price ?? book.GIATIEN,
    URLSACH: book.coverUrl || book.image || book.URLSACH || book.ANHSACH,
    SOLUONG: 1,
  })
  try {
    ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${book.name || book.TENSACH}`, type: 'success' })
  } catch (e) {}
}

// Xem tất cả sách
function viewAllBooks() {
  try {
    console.log('View all books clicked')
    // Reset category để hiển thị tất cả
    selectedCategoryId.value = null
    console.log('Selected category reset to:', selectedCategoryId.value)
  } catch (e) {
    console.error('Error in viewAllBooks:', e)
  }
}

function clearSearch() {
  searchQuery.value = ''
}

// Khi load trang -> gọi API
onMounted(async () => {
  getCategory(); // nếu bạn cần categories
  
  // Fetch top 5 books
  try {
    const topRes = await getTopBooks(5)
    topBooks.value = Array.isArray(topRes) ? topRes : topRes?.data ?? []
    console.log('Top books loaded:', topBooks.value.length)
  } catch (e) {
    console.error('Error fetching top books:', e)
    topBooks.value = []
  }
  
  // fetch 5 trending books (từ listing API)
  try {
    const res = await listBook({ per_page: 5, page: 1 })
    const rawBooks = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    books.value = rawBooks.map((book) => {
      const fallbackStock = book.inStock ?? book.SOLUONG
      const rawId = book.code || book.MASACH || book._id || book.id
      return {
        ...book,
        MASACH: rawId != null ? String(rawId) : null,
        TENSACH: book.name || book.TENSACH,
        TACGIA: book.author || book.TACGIA || 'Unknown',
        GIATIEN: book.price ?? book.GIATIEN,
        GIAGOC: book.originalPrice ?? book.GIAGOC,
        URLSACH: book.coverUrl || book.image || book.URLSACH || book.ANHSACH,
        ANHSACH: book.coverUrl || book.image || book.ANHSACH || book.URLSACH,
        MADANHMUC: book.category?.code || book.categoryCode || book.MADANHMUC,
        category: book.category || book.categoryData || null,
        SOLUONG: fallbackStock ?? 0,
        TRANGTHAI: book.status || book.TRANGTHAI || ((fallbackStock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng')
      }
    })
  } catch (e) {
    books.value = []
  }
  // init preview
  cartPreview.value = getCart();

  // register cart/books changed listeners via event bus
  if (typeof window !== 'undefined') {
    const onCartChanged = () => {
      cartPreview.value = getCart()
    }
    const onBooksChanged = async () => {
      try {
        const r = await listBook({ per_page: 5, page: 1 })
        books.value = r?.data ?? r ?? []
      } catch (e) {
        // ignore
      }
    }
    const onWishlistChanged = () => { 
      try { 
        wishlistIds.value = getWishlistIds()
        topBooksWishlistIds.value = getWishlistIds()
      } catch (e) {} 
    }
    try { onEvent('cart-changed', onCartChanged) } catch (e) {}
    try { onEvent('books-changed', onBooksChanged) } catch (e) {}
    try { onEvent('wishlist-changed', onWishlistChanged) } catch (e) {}

    // cleanup when module is disposed (HMR) or when component unmounts
    if (import.meta && import.meta.hot && import.meta.hot.dispose) {
      import.meta.hot.dispose(() => {
        try { offEvent('cart-changed', onCartChanged) } catch (e) {}
        try { offEvent('books-changed', onBooksChanged) } catch (e) {}
      })
    }
    onUnmounted(() => {
        try { offEvent('cart-changed', onCartChanged) } catch (e) {}
        try { offEvent('books-changed', onBooksChanged) } catch (e) {}
        try { offEvent('wishlist-changed', onWishlistChanged) } catch (e) {}
    })
  }
});


function refreshCartPreview() {
  cartPreview.value = getCart().slice(0, 3);
  showCartPreview.value = true;
}

function hidePreview() {
  showCartPreview.value = false;
}

function goToCart() {
  // navigate to /cart using router
  // `useRouter` cannot be used inside template directly, we need to import it
  router.push({ path: "/home/cart" });
}

// Thêm sản phẩm vào giỏ từ API
function handleAddToCart(book) {
  const rawId = book.MASACH || book.code || book._id || book.id
  const bookId = rawId != null ? String(rawId) : null
  if (!bookId) {
    console.warn('Không tìm thấy mã sách để thêm vào giỏ:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để thêm vào giỏ hàng.', type: 'warning' }) } catch (e) {}
    return
  }

  addToCart({
    MASACH: bookId,
    TENSACH: book.TENSACH || book.name,
    GIATIEN: book.GIATIEN ?? book.price,
    URLSACH: book.URLSACH ?? book.ANHSACH ?? book.coverUrl ?? book.image,
    SOLUONG: 1,
  })
  try {
    ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${book.TENSACH || book.name}`, type: 'success' })
  } catch (e) {}
}

// Xử lý ảnh + format giá
function getImage(filename) {
  return `${filename}`;
}
function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + "₫";
}
</script>

<style scoped>
/* Make all product images the same size and cover the area */
.product-img img {
  width: 160px;
  height: 220px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

/* Adjust product card layout a bit for consistent spacing */
.product-style1 {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-content .product-title {
  min-height: 42px; /* keep titles from shifting layout */
}

.book-search-bar {
  margin: 30px auto 20px;
  max-width: 640px;
  text-align: center;
}

.book-search-form {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #ffe0d5;
  border-radius: 999px;
  padding: 6px 16px;
  box-shadow: 0 6px 18px rgba(209, 112, 87, 0.15);
  transition: border-color 0.2s ease;
}

.book-search-form:focus-within {
  border-color: #d17057;
}

.book-search-form .search-icon {
  color: #d17057;
  font-size: 16px;
  margin-right: 12px;
}

.book-search-form .search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  padding: 8px 0;
  background: transparent;
  color: #2c3e50;
}

.book-search-form .search-input::placeholder {
  color: #a8b0b8;
}

.book-search-form .clear-btn {
  border: none;
  background: transparent;
  color: #d17057;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-search-form .clear-btn:hover {
  color: #b85d47;
}

.book-search-meta,
.search-meta {
  margin-top: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.book-search-meta span,
.search-meta span {
  font-weight: 600;
  color: #d17057;
}

/* Cart preview dropdown */
.go-cart-btn {
  position: relative;
  display: inline-block;
}
.cart-button {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.cart-preview {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  border-radius: 8px;
  z-index: 40;
}
.cart-preview-inner { padding: 12px; }
.cart-preview h4 { margin: 0 0 8px 0; font-size: 14px; }
.cart-preview ul { list-style: none; padding: 0; margin: 0; }
.preview-item { display: flex; gap: 8px; align-items: center; padding: 6px 0; }
.preview-item img { width: 48px; height: 70px; object-fit: cover; border-radius: 4px; }
.preview-item .meta { font-size: 13px; }
.preview-item .name { font-weight: 600; }
.preview-item .qty-price { color: #777; font-size: 12px; }
.preview-actions { display:flex; justify-content:flex-end; margin-top: 8px; }
.btn-view { background:#007bff; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
.empty { color:#666; padding:8px 0; text-align:center; }

/* Top 5 Books Modern Grid Styles */
.top-books-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  margin-bottom: 50px;
}

@media (max-width: 1200px) {
  .top-books-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .top-books-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .top-books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .top-books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* Top Book Card */
.top-book-card {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.top-book-card-inner {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-book-card-inner:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* Top Book Image */
.top-book-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  cursor: pointer;
}

.top-book-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.top-book-card-inner:hover .top-book-image {
  transform: scale(1.08);
}

/* Top Quick Actions Overlay */
.top-quick-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.top-book-card-inner:hover .top-quick-actions {
  opacity: 1;
}

.top-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #2c3e50;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.top-action-btn:hover {
  transform: scale(1.15);
}

.top-wishlist-btn:hover {
  background-color: #d17057;
  color: white;
}

.top-wishlist-btn.active {
  background-color: #d17057;
  color: white;
  animation: heartBeat 0.5s;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.25); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.2); }
}

.top-cart-btn:hover {
  background-color: #27ae60;
  color: white;
}

/* Top Book Info */
.top-book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.top-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* Top Rating */
.top-book-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffc107;
  font-size: 13px;
  font-weight: 600;
}

.top-book-rating i {
  font-size: 14px;
}

.top-book-rating span {
  color: #2c3e50;
}

/* Top Prices */
.top-book-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.top-price-current {
  font-size: 16px;
  font-weight: 700;
  color: #d17057;
  line-height: 1;
}

/* Top Author */
.top-book-author {
  font-size: 12px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.top-book-author i {
  font-size: 11px;
  color: #d17057;
}

/* Top Title */
.top-book-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
}

.top-book-title a {
  color: #2c3e50;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.top-book-title a:hover {
  color: #d17057;
}

/* Responsive Adjustments for Top Books */
@media (max-width: 768px) {
  .top-book-info {
    padding: 12px;
    gap: 8px;
  }
  
  .top-price-current {
    font-size: 14px;
  }
  
  .top-book-title {
    font-size: 13px;
  }
  
  .top-book-author {
    font-size: 11px;
  }
  
  .top-action-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>

