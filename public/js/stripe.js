import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe('pk_test_51I0f8fHgCBEcefPGHwrMnLgohxIkaNvYmiy4TP8dHwtERKAYRulj7HeKoSzoyVlJGgDzJBqmUcVIWPV2HXHcWwDB00m0QiyCXs');

export const bookTour = async tourId => {
    try {
        //1 get checkout session from api
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        
        //2 create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    }
    catch(err) {
        console.log(err);
        showAlert('error', err);
    }
}