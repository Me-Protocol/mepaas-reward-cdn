let popupVisible = false;
let popupClosed = false;
let offerData = null;
let env = "dev";
let APP_SETTINGS;

document.addEventListener("DOMContentLoaded", function () {
  // Container for the PAAS
  const ME_PAAS_CONTAINER = document.createElement("div");
  ME_PAAS_CONTAINER.id = "me-paas-container";
  document.body.appendChild(ME_PAAS_CONTAINER);

  const scriptTag = document.getElementById("mepaas-rewards");
  const apiKey = scriptTag ? scriptTag?.getAttribute("api-key") : null;
  const scriptTagProductId = scriptTag?.getAttribute("product-id");
  const scriptTagCustomerEmail = scriptTag?.getAttribute("customer-email");
  const scriptTagCustomerName = scriptTag?.getAttribute("customer-name");
  env = scriptTag ? scriptTag?.getAttribute("env") : "dev";

  const ref =
    window.location.search.split("ref=")[1] &&
    window.location.search.split("ref=")[1] === "me-rewards";

  console.log("GRAB API KEY AND ENV", scriptTag?.getAttribute("env"), apiKey);

  APP_SETTINGS = {
    iframeUrl:
      env === "local"
        ? "http://localhost:3000"
        : env === "development"
        ? "https://mepass-rewards-dev.vercel.app"
        : env === "staging"
        ? "https://mepass-rewards-staging.vercel.app"
        : "https://mepaas-rewards.vercel.app/",
    paasApiUrl:
      env === "local"
        ? "https://paas.usemeprotocol.com/v1/api"
        : env === "development"
        ? "https://paas.meappbounty.com/v1/api"
        : env === "staging"
        ? "https://paas.usemeprotocol.com/v1/api"
        : "https://paas.memarketplace.io/v1/api",
    businessApiUrl:
      env === "local"
        ? "https://api.usemeprotocol.com"
        : env === "development"
        ? "https://api.meappbounty.com"
        : env === "staging"
        ? "https://api.usemeprotocol.com"
        : "https://api.memarketplace.io",
  };

  const productId = scriptTagProductId
    ? scriptTag?.getAttribute("product-id")
    : window.productId;
  const customerEmail = scriptTagCustomerEmail
    ? scriptTag?.getAttribute("customer-email")
    : window.customerEmail;
  const customerName = scriptTagCustomerName
    ? scriptTag?.getAttribute("customer-name")
    : window.customerName;

  if (productId) {
    fetchOfferData();
  } else {
    initialize();
  }

  async function initialize(defaultOpen = false) {
    if (!apiKey) {
      return;
    }

    // Don't open modal on mobile when ref=me-rewards is present
    const isMobile = window.innerWidth <= 768;
    if (isMobile && ref && defaultOpen) {
      defaultOpen = false;
    }

    function constructIframeUrl() {
      return `${
        APP_SETTINGS.iframeUrl
      }?apiKey=${encodeURIComponent(apiKey)}${customerEmail ? `&email=${encodeURIComponent(customerEmail)}` : ""}${customerName ? `&name=${encodeURIComponent(customerName)}` : ""}${productId ? `&productId=${encodeURIComponent(productId)}` : ""}${offerData ? `&offerData=${encodeURIComponent(JSON.stringify(offerData))}` : ""}`;
    }

    const brandRes = await fetch(
      `${APP_SETTINGS.paasApiUrl}/auth/sdk/public-key`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-public-key": apiKey,
        },
        method: "POST",
      }
    );

    const brandData = await brandRes.json();

    const color1 = brandData.data?.brandPrimaryColor ?? "#000000";
    const color2 = lightenColor(color1, 10);
    const isRight =
      brandData?.data?.brandRewardButtonPosition === "bottom_right";

    const button = document.createElement("button");
    button.style.background = `linear-gradient(90deg, ${color2} 0%, ${color1} 100%)`;
    // onhover reverse the gradient
    button.addEventListener("mouseover", function () {
      button.style.background = `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`;
    });
    button.addEventListener("mouseout", function () {
      button.style.background = `linear-gradient(90deg, ${color2} 0%, ${color1} 100%)`;
    });
    button.classList.add("me-rewards-button");
    button.classList.add(isRight ? "right-side" : "left-side");
    button.innerHTML = `<span>Rewards</span>`;

    let modalOpen = false;

    const modal = document.createElement("div");
    modal.classList.add("me-paas-modal");
    modal.classList.add(isRight ? "right-side" : "left-side");
    const iframe = document.createElement("iframe");
    iframe.src = constructIframeUrl();
    iframe.allow = "clipboard-write; clipboard-read";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups allow-forms";

    modal.appendChild(iframe);
    ME_PAAS_CONTAINER.appendChild(modal);
    ME_PAAS_CONTAINER.appendChild(button);

    iframe.onload = function () {
      iframe.contentWindow.postMessage(
        { apiKey: apiKey, email: customerEmail, name: customerName },
        "*"
      );
    };

    function openModal() {
      closePopup();
      document.body.style.overflowX = "hidden";

      if (customerEmail) {
        iframe.contentWindow.postMessage(
          { email: customerEmail, name: customerName },
          "*"
        );
      }
      if (offerData) {
        iframe.contentWindow.postMessage(
          { offerData: offerData, productId: productId },
          "*"
        );
      }

      modal.classList.add("active");
      button.classList.add("active");

      modalOpen = true;
    }

    button.addEventListener("click", function () {
      if (!modalOpen) {
        openModal();
      } else {
        closeModal();
      }
    });

    const closeModal = function () {
      modal.classList.remove("active");
      button.classList.remove("active");
      document.body.style.overflowX = "";

      setTimeout(() => {
        modalOpen = false;
        if (offerData) {
          showOfferPopup();
        }
      }, 100);
    };

    window.addEventListener("message", function (event) {
      if (event.data.action === "goToSignUp") {
        window.location.href = "/account/register";
      } else if (event.data.action === "goToSignIn") {
        window.location.href = "/account/login";
      } else if (event.data.action === "goToProducts") {
        window.location.href = "/collections/all";
      } else if (event.data.action === "goToLogout") {
        window.location.href = "/account/logout";
      } else if (event.data.action === "closeModal") {
        closeModal();
      } else if (event.data.action === "openPage") {
        window.location.href = `${
          event.data.url
        }${window.location.search.replace(
          "?ref=me-rewards",
          ""
        )}?ref=me-rewards`;
      }
    });

    if (defaultOpen) {
      openModal();
    }
  }

  async function fetchOfferData() {
    try {
      const productIds = [productId];
      const queryParams = new URLSearchParams({
        productIds: JSON.stringify(productIds),
      });

      const response = await fetch(
        `${APP_SETTINGS.businessApiUrl}/brand/redemption-methods/get-by-product-ids?${queryParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          method: "GET",
        }
      );

      if (response.ok) {
        const res = await response.json();
        offerData = res?.data?.[0];

        if (offerData) {
          if (ref) {
            initialize(true);
          } else {
            showOfferPopup();
            initialize();
          }
        } else {
          initialize();
        }
      } else {
        console.error("Failed to fetch offer data");
      }
    } catch (error) {
      console.error("Error fetching offer data:", error);
    }
  }

  function showOfferPopup() {
    if (popupVisible) return;
    if (popupClosed) return;

    const OFFER_POPUP = document.createElement("div");
    OFFER_POPUP.classList.add("me-special-offer-popup");
    OFFER_POPUP.innerHTML = `
        <div class="me-special-offer-popup">
          <button id="me-offer-popup-close-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
          <img src="https://tidio-images-messenger.s3.amazonaws.com/syow1wpcd4vnrtfogriakjlqfr3nee0g/images/4b207885-48d2-46f9-abe4-67229ac89423.gif"/>
          <div>
            <h3>${getOfferDescription(offerData)} 🎁</h3>
            <p>Use your coupon to get a discount on this product. Click on the reward button to get started!</p>
          </div>
        </div>
    `;

    ME_PAAS_CONTAINER.appendChild(OFFER_POPUP);
    document
      .getElementById("me-offer-popup-close-button")
      .addEventListener("click", function () {
        popupClosed = true;
        offerData = null;
        closePopup();
      });
    popupVisible = true;
  }

  function closePopup() {
    const popup = document.querySelector(".me-special-offer-popup");
    if (popup) {
      popup.classList.add("hidden");
      setTimeout(() => {
        popup.remove();
        popupVisible = false;
      }, 100);
    }
  }
});

// Modules
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  const newColor = (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)
    .toUpperCase();

  return `#${newColor}`;
}

const getOfferDescription = (redeemMethod) => {
  const discountPercentage = Number(redeemMethod?.discountPercentage).toFixed(
    0
  );

  switch (redeemMethod?.type) {
    case "FREE_SHIPPING":
      return `Get free shipping on this product`;
    case "FIXED_AMOUNT_OFF":
      return `Get $${redeemMethod?.discountAmount} off on this product`;
    case "VARIABLE_AMOUNT_OFF":
      return `Get $${redeemMethod?.discountAmount} off on this product`;
    case "FIXED_PERCENTAGE_OFF":
      return `Get ${discountPercentage}% off on this product`;
    case "VARIABLE_PERCENTAGE_OFF":
      return `Get ${discountPercentage}% off on this product`;
    default:
      return "";
  }
};

// Style for the PAAS
const ME_PAAS_CONTAINER_STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap');
    #me-paas-container {
      font-family: 'Inter Tight', sans-serif;
    }
    .me-special-offer-popup {
      background-color: #fff;
      color: #000;
      border-radius: 12px;
      box-shadow: 0 8px 26px 0 rgba(0, 18, 46, 0.16);
      max-width: 340px;
      padding: 20px;
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 20px;
      transition: all 0.1s ease;
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 999999999 !important;
    }
    .me-special-offer-popup img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .me-special-offer-popup h3 {
      font-size: 18px;
      font-weight: 600;
      font-family: 'Inter Tight', sans-serif;
    }
    .me-special-offer-popup p {
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      font-family: 'Inter Tight', sans-serif;
      margin-top: 5px;
    }
    #me-offer-popup-close-button {
      background-color: #fff;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-radius: 100px;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
      width: 24px;
      height: 24px;
      color: #000;
      position: absolute;
      top: -30px;
      right: 0;
      transition: all 0.1s ease;
      opacity: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .me-special-offer-popup:hover #me-offer-popup-close-button {
      opacity: 1;
    }
    .hidden {
      display: none;
    }
    .me-paas-modal {
      position: fixed;
      bottom: 20px;
      z-index: 999999999 !important;
      width: 375px;
      height: 600px;
      padding: 0;
      background-color: #FAFAFA;
      border-radius: 24px;
      border: 1px solid #E6E6E6;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.4s ease;
      overflow: hidden;
      visibility: hidden;
    }
    .me-paas-modal.active {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
    .me-paas-modal iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .right-side {
      right: 20px;
    }
    .left-side {
      left: 20px;
    }
    .me-rewards-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 130px;
      height: 60px;
      border-radius: 100px;
      background-color: #000;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      position: fixed;
      bottom: 20px;
      border: none;
      transition: all 0.1s ease;
      transform: translateY(0px);
      opacity: 1;
      visibility: visible;
      z-index: 999999999 !important;
    }
    .me-rewards-button span {
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter Tight', sans-serif;
    }
    .me-rewards-button.active {
      transform: translateY(10px);
      opacity: 0;
      visibility: hidden;
    }
    @media (max-width: 768px) {
      #me-offer-popup-close-button {
        opacity: 1;
        visibility: visible;
      }
      .me-paas-modal {
        width: 100%;
        left: 0 !important;
        right: 0 !important;
        overflow-x: hidden;
        height: calc(100vh - 60px);
        border-radius: 0;
        position: fixed;
        bottom: 0 !important;
        top: 60px !important;
        border: none;
        transform: translateY(100vh);
      }
      .me-paas-modal.active {
        transform: translateY(0);
      }
      .me-rewards-button {
        width: 120px;
        height: 50px;
        font-size: 12px;
      }
      .me-rewards-button span {
        font-size: 12px;
      }
    }
    @media (max-height: 700px) {
      .me-paas-modal {
        height: calc(100vh - 50px);
        width: 360px;
      }
    }
`;
document.head.appendChild(document.createElement("style")).textContent =
  ME_PAAS_CONTAINER_STYLE;
