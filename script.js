document.addEventListener("DOMContentLoaded", () => {
  // ===== Du lieu de chinh sua =====
  const bankAccounts = {
    bride: {
      label: "Cô dâu",
      accountName: "THU THỦY",
      accountNumber: "0000 0000 0000",
      bankName: "[TÊN NGÂN HÀNG]",
      qrImage: "images/qr-bride.png"
    },
    groom: {
      label: "Chú rể",
      accountName: "THÀNH ĐẠT",
      accountNumber: "1111 1111 1111",
      bankName: "[TÊN NGÂN HÀNG]",
      qrImage: "images/qr-groom.png"
    }
  };

  // Anh du phong giup giao dien van dep khi chua co anh trong thu muc images.
  const fallbackWeddingImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=85"
  ];

  // Uu tien Google Apps Script neu da dan URL trong config.js.
  // API serverless va file JSON chi dung lam fallback khi chay preview tinh.
  const WISHES_APP_SCRIPT_URL = window.WEDDING_WISHES_APP_SCRIPT_URL || "";
  const WISHES_API_URL = window.WEDDING_WISHES_API_URL || "api/wishes";
  const WISHES_DB_URL = window.WEDDING_WISHES_DB_URL || WISHES_APP_SCRIPT_URL || WISHES_API_URL;
  const WISHES_WRITE_URL = window.WEDDING_WISHES_WRITE_URL || WISHES_APP_SCRIPT_URL || WISHES_API_URL;
  const WISHES_FALLBACK_DB_URL = "data/wishes.json";
  const WISHES_CACHE_KEY = "tdtt-wedding-wishes";
  const sampleWishes = [
    {
      name: "Một người bạn",
      message: "Chúc Thu Thủy và Thành Đạt luôn nắm tay nhau đi qua mọi mùa yêu thương.",
      createdAt: "2026-09-20"
    },
    {
      name: "Gia đình",
      message: "Mong hai con có một hành trình hôn nhân bình an, vui vẻ và đầy ắp tiếng cười.",
      createdAt: "2026-09-20"
    }
  ];

  const createQrPlaceholder = (label) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fff"/>
        <rect x="16" y="16" width="208" height="208" rx="4" fill="#faf6f2" stroke="#c98f8f" stroke-width="2"/>
        <g fill="#6f5052">
          <path d="M36 36h52v52H36zM44 44v36h36V44zM52 52h20v20H52z" fill-rule="evenodd"/>
          <path d="M152 36h52v52h-52zM160 44v36h36V44zM168 52h20v20h-20z" fill-rule="evenodd"/>
          <path d="M36 152h52v52H36zM44 160v36h36v-36zM52 168h20v20H52z" fill-rule="evenodd"/>
          <path d="M104 36h12v12h-12zM120 36h12v28h-12zM104 60h12v20h-12zM120 84h28v12h-28zM100 100h16v16h-16zM124 104h12v28h-12zM144 104h20v12h-20zM172 100h12v28h-12zM192 104h12v20h-12zM100 140h20v12h-20zM128 140h12v32h-12zM148 132h20v12h-20zM176 140h28v12h-28zM100 164h16v16h-16zM120 184h20v20h-20zM148 160h12v44h-12zM168 160h36v12h-36zM168 180h16v12h-16zM192 180h12v24h-12z"/>
        </g>
        <rect x="50" y="104" width="140" height="36" rx="18" fill="#fff"/>
        <text x="120" y="121" text-anchor="middle" dominant-baseline="middle" fill="#9f6668" font-family="Arial, sans-serif" font-size="11" font-weight="700">${label}</text>
        <text x="120" y="218" text-anchor="middle" fill="#9f6668" font-family="Arial, sans-serif" font-size="9">QR PLACEHOLDER</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  // ===== Ca nhan hoa theo ?name=... =====
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("name") || "").trim();
  const hasGuestName = Boolean(guestName);
  const guestGreeting = document.getElementById("guestGreeting");

  if (hasGuestName && guestGreeting) {
    guestGreeting.textContent = `Thân mời anh/chị ${guestName} đến dự hôn lễ của chúng tôi`;
    document.title = `Thiệp mời ${guestName} | Lễ thành hôn`;
  }

  // ===== Envelope opening intro =====
  const envelopeIntro = document.getElementById("envelopeIntro");
  const openEnvelopeButton = document.getElementById("openEnvelope");
  const envelopeRecipient = document.getElementById("envelopeRecipient");
  const siteShell = document.getElementById("siteShell");

  if (!hasGuestName) {
    document.body.classList.add("envelope-opened");
    document.body.classList.remove("intro-locked", "envelope-opening");
    envelopeIntro?.setAttribute("aria-hidden", "true");
  } else {
    document.body.classList.add("intro-locked");
    document.body.classList.remove("envelope-opened");
    envelopeIntro?.removeAttribute("aria-hidden");
    if (envelopeRecipient) {
      envelopeRecipient.textContent = `Kính mời: ${guestName}`;
    }
  }

  const openInvitation = () => {
    if (!hasGuestName || !envelopeIntro || envelopeIntro.classList.contains("is-opening")) return;

    envelopeIntro.classList.add("is-opening");
    document.body.classList.add("envelope-opening");

    const openDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 3250;
    window.setTimeout(() => {
      document.body.classList.add("envelope-opened");
      document.body.classList.remove("intro-locked", "envelope-opening");
      envelopeIntro.setAttribute("aria-hidden", "true");
      siteShell?.focus?.();
      window.scrollTo({ top: 0, behavior: "auto" });
    }, openDelay);
  };

  openEnvelopeButton?.addEventListener("click", openInvitation);

  // ===== Smooth scroll =====
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !prefersReducedMotion) {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  // ===== Anh du phong =====
  const galleryImages = [...document.querySelectorAll(".slide img")];
  galleryImages.forEach((image, index) => {
    image.addEventListener("error", () => {
      if (image.src !== fallbackWeddingImages[index]) {
        image.src = fallbackWeddingImages[index];
      }
    }, { once: true });
  });

  const preloadHero = new Image();
  preloadHero.onerror = () => {
    document.querySelector(".hero").style.backgroundImage =
      `linear-gradient(rgba(57, 42, 42, 0.32), rgba(57, 42, 42, 0.45)), url("${fallbackWeddingImages[0]}")`;
  };
  preloadHero.src = "images/wedding-1.jpg";

  const preloadClosing = new Image();
  preloadClosing.onerror = () => {
    document.querySelector(".closing").style.backgroundImage =
      `linear-gradient(rgba(83, 57, 58, 0.83), rgba(83, 57, 58, 0.88)), url("${fallbackWeddingImages[3]}")`;
  };
  preloadClosing.src = "images/wedding-4.jpg";

  // ===== Slider / carousel =====
  const sliderElement = document.getElementById("weddingSlider");
  const sliderTrack = sliderElement?.querySelector(".splide__list");
  const slides = [...document.querySelectorAll(".slide")];
  let splideGallery = null;
  let currentSlide = 0;
  let goToSlide = () => {};

  if (window.Splide && sliderElement) {
    splideGallery = new Splide(sliderElement, {
      type: "loop",
      speed: 760,
      easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      gap: "1rem",
      arrows: true,
      pagination: true,
      drag: true,
      keyboard: "global",
      lazyLoad: "nearby",
      classes: {
        arrows: "splide__arrows slider__arrows",
        arrow: "splide__arrow slider__arrow",
        prev: "splide__arrow--prev slider__arrow--prev",
        next: "splide__arrow--next slider__arrow--next",
        pagination: "splide__pagination slider__pagination",
        page: "splide__pagination__page slider__pagination-page"
      }
    });

    splideGallery.mount();
    goToSlide = (index) => splideGallery.go(index);
  } else if (sliderElement && sliderTrack) {
    sliderElement.classList.add("slider--fallback");
    const dotsContainer = document.createElement("div");
    const previousButton = document.createElement("button");
    const nextButton = document.createElement("button");
    let touchStartX = 0;

    previousButton.className = "splide__arrow splide__arrow--prev";
    nextButton.className = "splide__arrow splide__arrow--next";
    previousButton.type = "button";
    nextButton.type = "button";
    previousButton.setAttribute("aria-label", "Previous image");
    nextButton.setAttribute("aria-label", "Next image");
    previousButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
    nextButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';
    dotsContainer.className = "splide__pagination";
    sliderElement.append(previousButton, nextButton, dotsContainer);

    goToSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      [...dotsContainer.children].forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentSlide;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "splide__pagination__page";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to image ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    previousButton.addEventListener("click", () => goToSlide(currentSlide - 1));
    nextButton.addEventListener("click", () => goToSlide(currentSlide + 1));
    sliderTrack.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    sliderTrack.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 45) {
        goToSlide(currentSlide + (distance < 0 ? 1 : -1));
      }
    }, { passive: true });

    goToSlide(0);
  }

  // ===== Modal dung chung =====
  let lastFocusedElement = null;

  const openModal = (modal) => {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".modal__close")?.focus();
  };

  const closeModal = (modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastFocusedElement?.focus();
  };

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal")));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openModalElement = document.querySelector(".modal.is-open");
      if (openModalElement) closeModal(openModalElement);
    }

    if (event.key === "ArrowLeft" && !document.querySelector(".modal.is-open")) {
      if (splideGallery) {
        splideGallery.go("<");
      } else {
        goToSlide(currentSlide - 1);
      }
    }

    if (event.key === "ArrowRight" && !document.querySelector(".modal.is-open")) {
      if (splideGallery) {
        splideGallery.go(">");
      } else {
        goToSlide(currentSlide + 1);
      }
    }
  });

  // ===== Lightbox anh =====
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");

  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      const image = slide.querySelector("img");
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      openModal(lightbox);
    });
  });

  // ===== Chon tai khoan nhan qua =====
  const bankQr = document.getElementById("bankQr");
  const recipientBadge = document.getElementById("recipientBadge");
  const accountName = document.getElementById("accountName");
  const accountNumber = document.getElementById("accountNumber");
  const bankName = document.getElementById("bankName");
  const copyAccount = document.getElementById("copyAccount");
  let activeRecipient = "bride";

  const showBankAccount = (recipient) => {
    const account = bankAccounts[recipient];
    activeRecipient = recipient;
    recipientBadge.textContent = account.label;
    accountName.textContent = account.accountName;
    accountNumber.textContent = account.accountNumber;
    bankName.textContent = account.bankName;
    bankQr.alt = `Mã QR ngân hàng của ${account.label.toLowerCase()}`;
    bankQr.onerror = () => {
      bankQr.onerror = null;
      bankQr.src = createQrPlaceholder(account.label);
    };
    bankQr.src = account.qrImage;
  };

  document.querySelectorAll('input[name="recipient"]').forEach((input) => {
    input.addEventListener("change", () => showBankAccount(input.value));
  });

  copyAccount.addEventListener("click", async () => {
    const number = bankAccounts[activeRecipient].accountNumber.replace(/\s/g, "");
    try {
      await navigator.clipboard.writeText(number);
      copyAccount.textContent = "Đã chép";
    } catch {
      copyAccount.textContent = "Không thể chép";
    }

    window.setTimeout(() => {
      copyAccount.textContent = "Sao chép";
    }, 1800);
  });

  showBankAccount("bride");

  // ===== So loi chuc =====
  const wishesList = document.getElementById("wishesList");
  const wishesStatus = document.getElementById("wishesStatus");
  let currentWishes = [];

  const formatWishDate = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const normalizeWish = (wish) => ({
    name: (wish?.name || "Khách mời").trim(),
    message: (wish?.message || "").trim(),
    createdAt: wish?.createdAt || new Date().toISOString(),
    recipient: wish?.recipient || "",
    attendance: wish?.attendance || ""
  });

  const buildWishEndpoint = (url, action) => {
    const endpoint = new URL(url, window.location.href);
    if (action) endpoint.searchParams.set("action", action);
    if (url === WISHES_APP_SCRIPT_URL) endpoint.searchParams.set("_", Date.now().toString());
    return endpoint.toString();
  };

  const isAppsScriptEndpoint = (url) => /script\.google(?:usercontent)?\.com/.test(url);

  const getCachedWishes = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(WISHES_CACHE_KEY) || "[]");
      return Array.isArray(cached) ? cached.map(normalizeWish).filter((wish) => wish.message) : [];
    } catch {
      return [];
    }
  };

  const cacheWishes = (wishes) => {
    try {
      localStorage.setItem(WISHES_CACHE_KEY, JSON.stringify(wishes.slice(0, 50)));
    } catch {
      // Cache is only a speed boost; the page still works without it.
    }
  };

  const renderWishes = (wishes) => {
    if (!wishesList) return;

    wishesList.innerHTML = "";
    const displayWishes = wishes.length ? wishes : sampleWishes;

    displayWishes.slice(0, 50).forEach((wish) => {
      const card = document.createElement("article");
      card.className = "wish-card";

      const message = document.createElement("p");
      message.className = "wish-card__message";
      message.textContent = wish.message;

      const meta = document.createElement("div");
      meta.className = "wish-card__meta";

      const name = document.createElement("span");
      name.className = "wish-card__name";
      name.textContent = wish.name;

      const date = document.createElement("time");
      date.dateTime = wish.createdAt;
      date.textContent = formatWishDate(wish.createdAt);

      meta.append(name, date);
      card.append(message, meta);
      wishesList.appendChild(card);
    });
  };

  const loadWishes = async () => {
    if (!wishesList) return;

    const cachedWishes = getCachedWishes();
    if (cachedWishes.length) {
      currentWishes = cachedWishes;
      renderWishes(currentWishes);
      if (wishesStatus) wishesStatus.textContent = "";
    }

    try {
      const response = await fetch(buildWishEndpoint(WISHES_DB_URL, "list"), { cache: "no-store" });
      if (!response.ok) throw new Error("Cannot load wishes db");
      const data = await response.json();
      const sharedWishes = Array.isArray(data) ? data : data.wishes;
      currentWishes = (sharedWishes || []).map(normalizeWish).filter((wish) => wish.message);
      renderWishes(currentWishes);
      cacheWishes(currentWishes);
      if (wishesStatus) wishesStatus.textContent = "";
    } catch {
      if (cachedWishes.length) {
        if (wishesStatus) wishesStatus.textContent = "Chưa cập nhật được Google Sheet, đang hiển thị lời chúc đã lưu gần nhất.";
        return;
      }

      try {
        const fallbackResponse = await fetch(WISHES_FALLBACK_DB_URL, { cache: "no-store" });
        if (!fallbackResponse.ok) throw new Error("Cannot load fallback wishes db");
        const fallbackData = await fallbackResponse.json();
        const fallbackWishes = Array.isArray(fallbackData) ? fallbackData : fallbackData.wishes;
        currentWishes = (fallbackWishes || []).map(normalizeWish).filter((wish) => wish.message);
        renderWishes(currentWishes);
        cacheWishes(currentWishes);
        if (wishesStatus) wishesStatus.textContent = "Chưa kết nối được Google Sheet, đang hiển thị dữ liệu dự phòng.";
      } catch {
        currentWishes = sampleWishes.map(normalizeWish);
        renderWishes(currentWishes);
        if (wishesStatus) wishesStatus.textContent = "Chưa tải được sổ lời chúc, đang hiển thị lời chúc mẫu.";
      }
    }
  };

  const saveWish = async (wish) => {
    if (!wish.message) return;

    if (WISHES_WRITE_URL) {
      try {
        const isAppsScript = isAppsScriptEndpoint(WISHES_WRITE_URL);
        const response = await fetch(buildWishEndpoint(WISHES_WRITE_URL, "create"), {
          method: "POST",
          headers: { "Content-Type": isAppsScript ? "text/plain;charset=utf-8" : "application/json" },
          body: JSON.stringify(wish)
        });

        if (!response.ok) throw new Error("Cannot save wish");
        const data = await response.json().catch(() => null);
        if (data?.ok === false) throw new Error(data.error || "Cannot save wish");
        const savedWishes = Array.isArray(data?.wishes) ? data.wishes : [];
        if (savedWishes.length) {
          currentWishes = savedWishes.map(normalizeWish).filter((item) => item.message);
          renderWishes(currentWishes);
          cacheWishes(currentWishes);
          if (wishesStatus) wishesStatus.textContent = "";
        } else {
          await loadWishes();
        }
        return;
      } catch {
        if (wishesStatus) wishesStatus.textContent = "Chưa ghi được lời chúc lên Google Sheet, đang hiển thị tạm trên phiên này.";
      }
    }

    currentWishes = [wish, ...currentWishes].slice(0, 30);
    renderWishes(currentWishes);
    cacheWishes(currentWishes);
    if (wishesStatus) {
      wishesStatus.textContent = WISHES_WRITE_URL
        ? "Chưa ghi được vào Google Sheet, lời chúc đang hiển thị tạm trên phiên này."
        : "Đã hiển thị lời chúc trên phiên này.";
    }
  };

  loadWishes();

  // ===== Form va loi cam on =====
  const giftForm = document.getElementById("giftForm");
  const thankModal = document.getElementById("thankModal");
  const thankTitle = document.getElementById("thankTitle");
  const thankMessage = document.getElementById("thankMessage");

  giftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const senderName = document.getElementById("senderName").value.trim();
    const wishMessage = document.getElementById("wishMessage").value.trim();
    const selectedRecipient = document.querySelector('input[name="recipient"]:checked')?.value || "bride";
    const selectedAttendance = document.querySelector('input[name="attendance"]:checked')?.value || "attending";

    saveWish(normalizeWish({
      name: senderName || "Khách mời",
      message: wishMessage,
      createdAt: new Date().toISOString(),
      recipient: selectedRecipient,
      attendance: selectedAttendance
    }));

    if (senderName) {
      thankTitle.textContent = `Cảm ơn ${senderName}!`;
      thankMessage.textContent =
        `Cảm ơn anh/chị ${senderName} rất nhiều vì món quà và lời chúc tốt đẹp. ` +
        "Sự hiện diện và tình cảm của anh/chị là niềm vui lớn với chúng tôi.";
    } else {
      thankTitle.textContent = "Cảm ơn bạn!";
      thankMessage.textContent =
        "Cảm ơn anh/chị rất nhiều vì món quà và lời chúc tốt đẹp. " +
        "Sự hiện diện và tình cảm của anh/chị là niềm vui lớn với chúng tôi.";
    }

    openModal(thankModal);
  });

  // ===== Animation nhe khi cuon =====
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
});
