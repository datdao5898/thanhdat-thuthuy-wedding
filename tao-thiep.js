document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("guestLinkForm");
  const codeInput = document.getElementById("guestCode");
  const nameInput = document.getElementById("guestName");
  const adminKeyInput = document.getElementById("adminKey");
  const submitButton = document.getElementById("saveGuestButton");
  const status = document.getElementById("formStatus");
  const result = document.getElementById("linkResult");
  const generatedLink = document.getElementById("generatedLink");
  const copyButton = document.getElementById("copyGuestLink");
  const previewLink = document.getElementById("previewGuestLink");
  const guestApiUrl = window.WEDDING_GUESTS_APP_SCRIPT_URL
    || window.WEDDING_WISHES_APP_SCRIPT_URL
    || "";

  const normalizeCode = (value) => String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 24);

  const buildInvitationUrl = (code) => {
    const url = new URL("./", window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("i", code);
    return url.toString();
  };

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  codeInput.addEventListener("input", () => {
    const normalized = normalizeCode(codeInput.value);
    if (codeInput.value !== normalized) codeInput.value = normalized;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    result.hidden = true;
    setStatus("");

    const code = normalizeCode(codeInput.value);
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    const audience = form.elements.audience.value === "senior" ? "senior" : "friend";
    const adminKey = adminKeyInput.value;

    if (code.length < 2 || !name || !adminKey) {
      setStatus("Vui lòng nhập đầy đủ mã, họ tên và khóa quản trị.", true);
      return;
    }
    if (!guestApiUrl) {
      setStatus("Chưa cấu hình địa chỉ lưu danh sách khách mời.", true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Đang lưu…";
    setStatus("Đang lưu khách mời vào danh sách…");

    try {
      const response = await fetch(guestApiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          action: "guest-upsert",
          code,
          name,
          audience,
          adminKey
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Không thể lưu khách mời");
      }

      const inviteUrl = buildInvitationUrl(data.guest.code);
      generatedLink.value = inviteUrl;
      previewLink.href = inviteUrl;
      result.hidden = false;
      setStatus(`Đã lưu ${data.guest.name}. Anh có thể sao chép link bên dưới.`);
    } catch (error) {
      const detail = String(error?.message || "");
      const message = detail.includes("admin key")
        ? "Khóa quản trị chưa đúng hoặc chưa được cấu hình."
        : "Chưa thể lưu khách mời. Hãy kiểm tra lại kết nối và bản triển khai Apps Script.";
      setStatus(message, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Lưu và tạo link";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!generatedLink.value) return;

    try {
      await navigator.clipboard.writeText(generatedLink.value);
    } catch {
      generatedLink.select();
      document.execCommand("copy");
    }

    copyButton.textContent = "Đã sao chép";
    window.setTimeout(() => {
      copyButton.textContent = "Sao chép";
    }, 1600);
  });
});
