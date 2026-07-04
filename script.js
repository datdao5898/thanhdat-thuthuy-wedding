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

  // ===== Envelope opening intro =====
  const envelopeIntro = document.getElementById("envelopeIntro");
  const openEnvelopeButton = document.getElementById("openEnvelope");
  const siteShell = document.getElementById("siteShell");

  const openInvitation = () => {
    if (!envelopeIntro || envelopeIntro.classList.contains("is-opening")) return;

    envelopeIntro.classList.add("is-opening");
    document.body.classList.add("envelope-opening");

    const openDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 2850;
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

  // ===== Ca nhan hoa loi moi tu ?name=... =====
  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("name") || "").trim();
  const guestGreeting = document.getElementById("guestGreeting");

  if (guestName && guestGreeting) {
    guestGreeting.textContent = `Thân mời anh/chị ${guestName} đến dự hôn lễ của chúng tôi`;
    document.title = `Thiệp mời ${guestName} | Lễ thành hôn`;
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

  // ===== Form va loi cam on =====
  const giftForm = document.getElementById("giftForm");
  const thankModal = document.getElementById("thankModal");
  const thankTitle = document.getElementById("thankTitle");
  const thankMessage = document.getElementById("thankMessage");

  giftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const senderName = document.getElementById("senderName").value.trim();

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
