document.addEventListener("DOMContentLoaded", function () {
  const scriptTag = document.getElementById("mepaas-rewards");
  let apiKey = scriptTag ? scriptTag?.getAttribute("api-key") : null;

  let offerData = null;
  let popupVisible = false;
  let iframe = null;

  const checkApiKeyInterval = setInterval(() => {
    if (window.apiKey) {
      console.log("Found window.apiKey", window.apiKey);
      apiKey = window.apiKey;
      clearInterval(checkApiKeyInterval);
      initialize();
    }
  }, 1000);

  function initialize() {
    if (!apiKey) {
      return;
    }

    function constructIframeUrl() {
      return `https://mepass-rewards-dev.vercel.app?apiKey=${apiKey}${offerData ? `&offerData=${encodeURIComponent(JSON.stringify(offerData))}` : ""}`;
    }

    const button = document.createElement("button");
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.height = "60px";
    button.style.width = "130px";
    button.style.borderRadius = "100px";
    button.style.backgroundColor = "#000";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = "1000";
    button.style.fontSize = "14px";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.gap = "8px";
    button.style.transition = "all 0.1s linear";
    button.style.overflow = "hidden";

    const buttonText = document.createElement("span");
    buttonText.innerText = "Rewards";

    const svgIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("fill", "none");
    svgIcon.setAttribute("viewBox", "0 0 24 24");
    svgIcon.setAttribute("stroke-width", "1.5");
    svgIcon.setAttribute("stroke", "currentColor");
    svgIcon.style.height = "24px";
    svgIcon.style.width = "24px";
    svgIcon.style.color = "#fff";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute(
      "d",
      "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
    );

    svgIcon.appendChild(path);
    button.appendChild(svgIcon);
    button.appendChild(buttonText);
    document.body.appendChild(button);

    let modalOpen = false;

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.bottom = "100px";
    modal.style.right = "20px";
    modal.style.width = "360px";
    modal.style.height = "600px";
    modal.style.padding = "0";
    modal.style.backgroundColor = "#fff";
    modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    modal.style.borderRadius = "12px";
    modal.style.zIndex = "1001";
    modal.style.display = "none";
    modal.style.flexDirection = "column";
    modal.style.alignItems = "flex-end";
    modal.style.transform = "translateY(20px)";
    modal.style.opacity = "0";
    modal.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    modal.style.overflow = "hidden";

    iframe = document.createElement("iframe");
    iframe.src = constructIframeUrl();
    iframe.allow = "clipboard-write";
    iframe.sandbox = "allow-scripts allow-same-origin";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";

    modal.appendChild(iframe);
    document.body.appendChild(modal);

    iframe.onload = function () {
      console.log("Sending api key to iframe", apiKey);
      iframe.contentWindow.postMessage({ apiKey: apiKey }, "*");
    };

    button.addEventListener("click", function () {
      if (!modalOpen) {
        closePopup();

        console.log("Sending email to iframe", window.customerEmail);

        if (window.customerEmail) {
          iframe.contentWindow.postMessage(
            { email: window.customerEmail },
            "*"
          );
        }

        modal.style.display = "flex";
        setTimeout(() => {
          modal.style.transform = "translateY(0)";
          modal.style.opacity = "1";
        }, 10);

        if (window.innerWidth <= 768) {
          button.style.display = "none";
        }

        button.innerText = "";

        const closeIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        closeIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        closeIcon.setAttribute("fill", "none");
        closeIcon.setAttribute("viewBox", "0 0 24 24");
        closeIcon.setAttribute("stroke-width", "1.5");
        closeIcon.setAttribute("stroke", "currentColor");
        closeIcon.style.height = "24px";
        closeIcon.style.width = "24px";
        closeIcon.style.color = "#fff";

        const closePath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        closePath.setAttribute("stroke-linecap", "round");
        closePath.setAttribute("stroke-linejoin", "round");
        closePath.setAttribute("d", "M6 18 18 6M6 6l12 12");

        closeIcon.appendChild(closePath);
        button.appendChild(closeIcon);

        button.style.width = "60px";

        modalOpen = true;
      } else {
        closeModal();
      }
    });

    const closeModal = function () {
      modal.style.transform = "translateY(20px)";
      modal.style.opacity = "0";

      setTimeout(() => {
        modal.style.display = "none";
        if (window.innerWidth <= 768) {
          button.style.display = "flex";
        }
        modalOpen = false;
        if (offerData) {
          showPopup();
        }
      }, 100);

      button.innerHTML = "";
      button.appendChild(svgIcon);
      button.appendChild(buttonText);
      button.style.width = "130px";
    };

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    function handleMediaQueryChange(e) {
      if (e.matches) {
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.bottom = "0";
        modal.style.right = "0";
        modal.style.borderRadius = "0";
        if (modalOpen) {
          button.style.display = "none";
        } else {
          button.style.display = "flex";
        }
      } else {
        modal.style.width = "400px";
        modal.style.height = "600px";
        modal.style.bottom = "100px";
        modal.style.right = "20px";
        modal.style.borderRadius = "12px";
        button.style.display = "flex";
      }
    }

    mediaQuery.addListener(handleMediaQueryChange);
    handleMediaQueryChange(mediaQuery);

    window.addEventListener("message", function (event) {
      if (event.data.action === "goToSignUp") {
        window.location.href = "/account/register";
      } else if (event.data.action === "goToSignIn") {
        window.location.href = "/account/login";
      } else if (event.data.action === "closeModal") {
        closeModal();
      } else if (event.data.action === "openPage") {
        window.location.href = event.data.url;
      }
    });

    async function fetchOfferData() {
      try {
        const productIds = [window.productId];
        const queryParams = new URLSearchParams({
          productIds: JSON.stringify(productIds),
        });
        const url = `https://api.meappbounty.com/brand/redemption-methods/get-by-product-ids?${queryParams}`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          method: "GET",
        });

        if (response.ok) {
          const res = await response.json();
          offerData = res.data?.[0];

          if (offerData) {
            showPopup();
            updateIframeUrl();
          }
        } else {
          console.error("Failed to fetch offer data");
        }
      } catch (error) {
        console.error("Error fetching offer data:", error);
      }
    }

    function updateIframeUrl() {
      iframe.src = constructIframeUrl();
    }

    function showPopup() {
      if (popupVisible) return;

      const popup = document.createElement("div");
      popup.id = "special-offer-popup";
      popup.style.position = "fixed";
      popup.style.bottom = "90px";
      popup.style.right = "20px";
      // popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      popup.style.color = "#fff";
      // popup.style.padding = "10px 20px";
      popup.style.borderRadius = "8px";
      popup.style.zIndex = "1002";
      // popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      popup.style.cursor = "pointer";

      const popupText = document.createElement("span");
      popupText.innerHTML = `
        <div style="background-color: #5434F6; color: #fff; border-radius: 35px; border-bottom-right-radius: 6px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 300px; padding: 20px; display: flex; align-items: center; gap: 20px;">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#fff" style="width: 50px; height: 50px; color: #000;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <div>
            <h3 style="font-size: 16px; color: #fff;">Redeem Your Coupon</h3>
            <p style="font-size: 14px; margin-top: 5px; color: #fff;">Use your coupon to get a discount on this product.</p>
          </div>
        </div>
      `;
      popup.appendChild(popupText);

      document.body.appendChild(popup);
      popupVisible = true;

      button.addEventListener("click", function () {
        if (popupVisible) {
          closePopup();
        }
      });
    }

    function closePopup() {
      const popup = document.getElementById("special-offer-popup");
      if (popup) {
        document.body.removeChild(popup);
        popupVisible = false;
      }
    }

    if (window.productId) {
      fetchOfferData();
    }
  }
});
