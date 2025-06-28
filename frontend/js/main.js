function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s.-]/g, "") // Remove all non-word characters except spaces, dots, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const programName = urlParams.get("program");

  if (programName) {
    const programSlug = slugify(programName);
    const returnUrl = `/${programSlug}`;
    const returnButton = document.getElementById("returnButton");
    if (returnButton) {
      returnButton.setAttribute("href", returnUrl);
    }
  }

  const buyBtn = document.querySelector(".buy-button");
  const lambdaEndpoint =
    "https://<<yourendpoint>>.execute-api.us-east-1.amazonaws.com";

  if (buyBtn) {
    const spinner = buyBtn.querySelector(".spinner");
    const buttonText = buyBtn.querySelector(".button-text");

    buyBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      buyBtn.classList.add("loading");
      const programName =
        buyBtn.getAttribute("data-program") || "Unknown Product";

      try {
        const response = await fetch(`${lambdaEndpoint}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "create", programName }),
        });

        const result = await response.json();

        if (response.ok && result.approvalUrl) {
          window.location.href = result.approvalUrl;
        } else {
          alert("An unexpected error occurred. Please try again later.");
        }
      } catch (err) {
        alert(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } finally {
        buyBtn.classList.remove("loading");
      }
    });
  }

  const downloadLink = document.getElementById("download-link");
  const downloadSection = document.getElementById("download-section");
  const paymentSpinner = document.getElementById("spinner");
  const statusMessage = document.getElementById("status-message");
  const errorSection = document.getElementById("error-section");
  const errorMessage = document.getElementById("error-message");

  if (downloadLink && downloadSection) {
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get("token");

    if (!orderID) {
      statusMessage.textContent = "Missing payment details.";
      paymentSpinner.classList.add("d-none");
      return;
    }

    fetch(`${lambdaEndpoint}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "capture", orderID }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        paymentSpinner.classList.add("d-none");
        if (ok && data.downloadLink) {
          document.querySelector("h2").textContent =
            "Thank You for Your Purchase!";
          statusMessage.textContent = "Your payment has been confirmed.";
          downloadLink.href = data.downloadLink;
          downloadSection.classList.remove("d-none");
          downloadLink.click(); // Trigger automatic download

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "purchase",
            transaction_id: data.transactionID,
            value: data.amount,
            currency: "USD",
            items: [
              {
                item_name: data.programName,
                item_id: data.sku,
                price: data.amount,
                quantity: 1,
              },
            ],
          });
        } else {
          document.querySelector("h2").textContent = "Payment Failed";
          statusMessage.textContent =
            "There was an issue confirming your payment. Please try again.";
          errorMessage.textContent = "Please contact support for assistance.";
          errorSection.classList.remove("d-none");
        }
      })
      .catch((error) => {
        paymentSpinner.classList.add("d-none");
        document.querySelector("h2").textContent = "Payment Error";
        statusMessage.textContent =
          "An error occurred while confirming your payment.";
        errorMessage.textContent = "Please try again later or contact support.";
        errorSection.classList.remove("d-none");
      });
  }
});
