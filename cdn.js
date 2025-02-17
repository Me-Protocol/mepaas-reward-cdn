let popupVisible = false;
let offerData = null;
let iframe = null;
let apiKey = null;

document.addEventListener("DOMContentLoaded", function () {
  const scriptTag = document.getElementById("mepaas-rewards");
  const grabApiKey = scriptTag ? scriptTag?.getAttribute("api-key") : null;

  const checkApiKeyInterval = setInterval(() => {
    if (grabApiKey) {
      apiKey = grabApiKey;
      clearInterval(checkApiKeyInterval);
      if (!window.productId) {
        initialize();
      } else {
        fetchOfferData(apiKey);
      }
    } else if (window.apiKey) {
      apiKey = window.apiKey;
      clearInterval(checkApiKeyInterval);
      if (!window.productId) {
        initialize();
      } else {
        fetchOfferData(apiKey);
      }
    }
  }, 1000);

  async function initialize() {
    if (!apiKey) {
      return;
    }

    // make api call to get brand details before showing the rewards button

    const brandRes = await fetch(
      "https://paas.meappbounty.com/v1/api/auth/sdk/public-key",
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

    function constructIframeUrl() {
      return `https://mepass-rewards-dev.vercel.app?apiKey=${apiKey}`;
    }

    const button = document.createElement("button");
    button.style.position = "fixed";
    button.style.bottom = "20px";
    // position button

    if (isRight) {
      button.style.right = "20px";
    } else {
      button.style.left = "20px";
    }

    button.style.height = "60px";
    button.style.width = "130px";
    button.style.borderRadius = "100px";
    button.style.background = `linear-gradient(90deg, ${color2} 0%, ${color1} 100%)`;
    button.style.boxShadow = "0 8px 26px 0 rgba(0, 18, 46, 0.16)";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = "1500";
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
    modal.style.bottom = "150px";
    if (isRight) {
      modal.style.right = "20px";
    } else {
      modal.style.left = "20px";
    }
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

        if (window.customerEmail) {
          iframe.contentWindow.postMessage(
            { email: window.customerEmail },
            "*"
          );
        }

        if (offerData) {
          iframe.contentWindow.postMessage(
            { offerData: offerData, productId: window.productId },
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
          showOfferPopup();
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
  }

  async function fetchOfferData(apiKey) {
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
          showOfferPopup();
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

    const popup = document.createElement("div");
    popup.id = "special-offer-popup";
    popup.style.position = "fixed";
    popup.style.bottom = "100px";
    popup.style.right = "20px";
    popup.style.borderRadius = "12px";
    popup.style.zIndex = "1000";
    // popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    popup.style.cursor = "pointer";

    const popupText = document.createElement("span");
    popupText.innerHTML = `
        <div style="background-color: #fff; color: #000; border-radius: 12px; box-shadow: 0 8px 26px 0 rgba(0, 18, 46, 0.16); max-width: 340px; padding: 20px; display: flex; align-items: center; flex-direction: column; gap: 20px;">
          <img src="https://tidio-images-messenger.s3.amazonaws.com/syow1wpcd4vnrtfogriakjlqfr3nee0g/images/4b207885-48d2-46f9-abe4-67229ac89423.gif" style="height: 200px; width: 100%; object-fit: cover;" />
          <div>
            <h3 style="font-size: 18px;">${getOfferDescription(
              offerData
            )} 🎁</h3>
            <p style="font-size: 16px; margin-top: 5px; color: font-weight: light; color: #ACB0B9;">Use your coupon to get a discount on this product. Click on the reward button to get started!</p>
          </div>
        </div>
      `;
    popup.appendChild(popupText);

    document.body.appendChild(popup);
    popupVisible = true;
  }

  function closePopup() {
    const popup = document.getElementById("special-offer-popup");
    if (popup) {
      document.body.removeChild(popup);
      popupVisible = false;
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
  switch (redeemMethod?.type) {
    case "FREE_SHIPPING":
      return `Get free shipping on this product`;
    case "FIXED_AMOUNT_OFF":
      return `Get $${redeemMethod?.discountAmount} off on this product`;
    case "VARIABLE_AMOUNT_OFF":
      return `Get $${redeemMethod?.discountAmount} off on this product`;
    case "FIXED_PERCENTAGE_OFF":
      return `Get ${redeemMethod?.discountPercentage}% off on this product`;
    default:
      return "";
  }
};
