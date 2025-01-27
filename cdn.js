document.addEventListener("DOMContentLoaded", function () {
  // Select the script tag by its ID
  const scriptTag = document.getElementById("mepaas-rewards");
  // Get the value of the `api-key` attribute
  const apiKey = scriptTag.getAttribute("api-key");

  let customerData = null;

  if (!apiKey) {
    return;
  }

  let iframeUrl = `https://mepass-rewards-dev.vercel.app?apiKey=${apiKey}`;

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

  // Create the text span
  const buttonText = document.createElement("span");
  buttonText.innerText = "Rewards";

  // Create the SVG icon
  const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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

  // Append the path to the SVG
  svgIcon.appendChild(path);

  // Append both text and SVG to the button
  button.appendChild(svgIcon);
  button.appendChild(buttonText);

  // Append the button to the document
  document.body.appendChild(button);

  let modalOpen = false;

  // Create modal and iframe (preload the iframe)
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

  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.allow = "clipboard-write";
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
      // Post data
      if (customerData) {
        iframe.contentWindow.postMessage(customerData, iframeUrl);
      }

      // Show the preloaded modal
      modal.style.display = "flex";
      setTimeout(() => {
        modal.style.transform = "translateY(0)";
        modal.style.opacity = "1";
      }, 10);

      // On mobile, hide the button when the modal is open
      if (window.innerWidth <= 768) {
        button.style.display = "none";
      }

      // Replace button content with the SVG icon (close icon)
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

      button.style.width = "60px"; // Adjust button size for the icon

      modalOpen = true;
    } else {
      closeModal();
    }
  });

  const closeModal = function () {
    // Hide the modal when the button is clicked again
    modal.style.transform = "translateY(20px)";
    modal.style.opacity = "0";

    setTimeout(() => {
      modal.style.display = "none"; // Hide the modal after the transition
      if (window.innerWidth <= 768) {
        button.style.display = "flex"; // Show the button again only on mobile
      }
      modalOpen = false;
    }, 100);

    // Reset the button text, icon, and size with transition
    button.innerHTML = ""; // Clear button content
    button.appendChild(svgIcon); // Append the original icon
    button.appendChild(buttonText); // Append the original text
    button.style.width = "130px";
  };

  // Media query to make modal fullscreen on mobile
  const mediaQuery = window.matchMedia("(max-width: 768px)");
  function handleMediaQueryChange(e) {
    if (e.matches) {
      // Mobile view: make the modal fullscreen
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.bottom = "0";
      modal.style.right = "0";
      modal.style.borderRadius = "0"; // Remove border-radius for fullscreen
      if (modalOpen) {
        button.style.display = "none";
      } else {
        button.style.display = "flex";
      }
    } else {
      // Revert to default styles for larger screens
      modal.style.width = "360px";
      modal.style.height = "600px";
      modal.style.bottom = "100px";
      modal.style.right = "20px";
      modal.style.borderRadius = "12px";
      button.style.display = "flex";
    }
  }

  // Attach listener to the media query
  mediaQuery.addListener(handleMediaQueryChange);

  // Initial check to apply styles based on screen size
  handleMediaQueryChange(mediaQuery);

  window.addEventListener("message", function (event) {
    // if (event.target !== iframeUrl) return;
    if (event.data.action === "goToSignUp") {
      window.location.href = "/account/register";
    } else if (event.data.action === "goToSignIn") {
      window.location.href = "/account/login";
    } else if (event.data.action === "closeModal") {
      closeModal();
    }
  });

  // function to send customer data to the iframe
  function setCustomerData(data) {
    customerData = data;
  }

  window.setCustomerData = setCustomerData;
});
