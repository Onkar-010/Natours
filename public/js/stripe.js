/**
 * es
 *
 * @format */

//@ts-ignore
const stripe = Stripe(
  `pk_test_51ShWnkJuSFHWIVq9gXdotzYlBQ6LS9AfhAlDVthP2grj3l2JPdAGmLIVIN25QEgKOZX29DMWw1U3YQO9JHAqWctv00xev37gWY`
);

const bookTour = async (tourId) => {
  try {
    //GEt Checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);

    // Create checkOut form + charge Credite carde for us
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    alert(err);
  }
};

document.getElementById("book-tour").addEventListener("click", (e) => {
  e.target.textContent = `Processing...`;
  const tourId = e.target.dataset.tourId;
  bookTour(tourId);
});
