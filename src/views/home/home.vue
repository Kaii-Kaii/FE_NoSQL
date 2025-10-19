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
              <a class="vs-btn wow animate__flipInX" data-wow-delay="0.95s" href="shop.html">Explore More</a>
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
  <!-- Offer section Start -->
  <div class="offer-layout1 space-bottom">
    <div class="container">
      <div class="row g-4">
        <div class="col-xl-6 col-lg-6">
          <div class="offer-style1 wow animate__fadeInLeft" data-wow-delay="0.30s"
            data-bg-src="@/assets/img/bg/offer-bg1.jpg">
            <div class="offer-img">
              <img src="@/assets/img/offer/offer-img1.png" alt="offer image">
            </div>
            <div class="offer-content">
              <div class="star-rating">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
              </div>
              <h2 class="offer-title">E Emeher Mme</h2>
              <p class="offer-price">Only From <span>$85.00</span></p>
              <a class="vs-btn" href="shop.html">Shop Now</a>
            </div>
            <span class="shape-mockup element1 z-index1  d-xxl-block d-none" data-wow-delay="0.80s"
              style="right: 0px; bottom: -5px;"><img src="@/assets/img/shapes/offer-shape1.png"
                alt="offer shape"></span>
          </div>
        </div>
        <div class="col-xl-6 col-lg-6">
          <div class="offer-style1 white-style wow animate__fadeInRight" data-wow-delay="0.30s"
            data-bg-src="@/assets/img/bg/offer-bg2.jpg">
            <div class="offer-img">
              <img src="@/assets/img/offer/offer-img1.png" alt="offer image">
            </div>
            <div class="offer-content">
              <div class="star-rating">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
              </div>
              <h2 class="offer-title">Viving Moneme</h2>
              <p class="offer-price">Only From <span>$85.00</span></p>
              <a class="vs-btn" href="shop.html">Shop Now</a>
            </div>
            <span class="shape-mockup element1 z-index1  d-xxl-block d-none" data-wow-delay="0.80s"
              style="right: 0px; bottom: -5px;"><img src="@/assets/img/shapes/offer-shape2.png"
                alt="offer shape"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Offer section End -->
  <!-- Top Categories Start -->
  <section class="categories-layout1 space" data-bg-src="@/assets/img/bg/categorie-bg1.jpg">
    <div class="container">
      <div class="title-area text-center animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">Top 5 Books</h2>
      </div>
      
      <!-- Top 5 Books - 1 hàng -->
      <div class="row g-4 mb-50">
        <div 
          v-for="book in topBooks" 
          :key="book._id || book.id" 
          class="col-lg-2-4"
          style="width: calc(20% - 12px);"
        >
          <div class="product-style1">
            <div class="product-img">
              <img 
                :src="book.coverUrl || book.image || '@/assets/img/product/default.jpg'" 
                :alt="book.name"
                style="width: 100%; height: 220px; object-fit: cover;"
              >
              <div class="product-btns">
                <button class="icon-btn wishlist" @click="toggleWishlistTopBook(book)" :class="{ active: isWishedTopBook(book._id || book.id) }">
                  <i :class="isWishedTopBook(book._id || book.id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <button class="icon-btn cart" @click="handleAddToCartTopBook(book)">
                  <i class="fa-solid fa-basket-shopping"></i>
                </button>
              </div>
            </div>
            <div class="product-content text-center mt-2">
              <h5 class="product-title" style="font-size: 14px; min-height: 40px;">{{ book.name }}</h5>
              <p class="price fw-bold text-danger" style="margin: 8px 0;">{{ formatPrice(book.price) }}</p>
              <p class="desc small text-muted" style="font-size: 12px; margin: 0;">{{ book.author }}</p>
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
      
      <!-- Category Grid Component -->
      <Category @category-selected="handleCategorySelected" />

      <!-- book-list -->
      <BookList :selectedCategory="selectedCategoryId" />

      <div class="text-center">
        <a class="vs-btn wow animate__flipInX" data-wow-delay="0.40s" href="shop.html">View More</a>
      </div>
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
  <!-- Best selling End -->
  <!-- Sách Thiếu Nhi Start -->
  <CategoryBooks 
    :categoryId="3" 
    title="Bán Chạy Sách Thiếu Nhi"
    :limit="6"
  />
  <!-- Sách Thiếu Nhi End -->
  <!-- Sách Lịch Sử Việt Nam Start -->
   <CategoryBooks 
    :categoryId="5" 
    title="Bán Chạy Sách Lịch Sử Việt Nam"
    :limit="6"
  />
  <!-- Sách Lịch Sử Việt Nam End -->
  <!-- Book Of The Month End -->
  
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
const wishlistIds = ref(getWishlistIds());
const topBooksWishlistIds = ref(new Set());

// Wishlist helpers
function isWished(id) {
  try { return wishlistIds.value.has(id) } catch (e) { return false }
}
function toggleWishlist(book) {
  const wasWished = isWished(book.MASACH)
  toggleWishlistApi({
    MASACH: book.MASACH,
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
  try { return topBooksWishlistIds.value.has(id) } catch (e) { return false }
}

function toggleWishlistTopBook(book) {
  const bookId = book._id || book.id
  const wasWished = isWishedTopBook(bookId)
  
  // Convert API response to cart format
  toggleWishlistApi({
    MASACH: bookId,
    TENSACH: book.name,
    GIATIEN: book.price,
    URLSACH: book.coverUrl || book.image,
  })
  
  topBooksWishlistIds.value = new Set(topBooksWishlistIds.value)
  if (wasWished) {
    topBooksWishlistIds.value.delete(bookId)
  } else {
    topBooksWishlistIds.value.add(bookId)
  }
  
  try {
    ElNotification({
      title: 'Success',
      message: wasWished ? `Đã bỏ khỏi yêu thích: ${book.name}` : `Đã thêm vào yêu thích: ${book.name}`,
      type: 'success',
    })
  } catch (e) {}
}

// Thêm top book vào giỏ
function handleAddToCartTopBook(book) {
  const bookId = book._id || book.id
  addToCart({
    MASACH: bookId,
    TENSACH: book.name,
    GIATIEN: book.price,
    URLSACH: book.coverUrl || book.image,
    SOLUONG: 1,
  });
  try {
    ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${book.name}`, type: 'success' })
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
    books.value = res?.data ?? res ?? []
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
  // pass API-shaped object (uppercase keys) — addToCart expects API fields like MASACH, URLSACH
  addToCart({
    MASACH: book.MASACH,
    TENSACH: book.TENSACH,
    GIATIEN: book.GIATIEN,
    URLSACH: book.URLSACH ?? book.ANHSACH,
    SOLUONG: 1,
  });
  try {
    ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${book.TENSACH}`, type: 'success' })
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
</style>

