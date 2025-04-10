/*eslint-disable*/
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51RBDEiB911lX256MS3z3eMpeI4FRiqcKI4u4UFWJE9WyapxdUFMaV1JBNgzAFsbQmVs6bumqJiafh7bqWLsc0IGh00QTHA8Cgx',
);

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
