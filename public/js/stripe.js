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
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);
    // Create checkOut form + charge Credite carde for us
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    alert(err);
  }
};

console.log("button Clicked Book");
document.getElementById("book-tour").addEventListener("click", (e) => {
  e.target.textContent = `Processing...`;
  const tourId = e.target.dataset.tourId;
  bookTour(tourId);
});
