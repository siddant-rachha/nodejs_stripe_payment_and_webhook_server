const { Router } = require("express")
const { Stripe } = require("stripe")

const dotenv = require("dotenv")
dotenv.config();

const router = Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

router.get('/public-pay-key', (req, res) => {
    res.send({
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

router.post('/create-payment-intent', async (req, res) => {
    // Create a PaymentIntent with the amount, currency, and a payment method type.
    //
    // See the documentation [0] for the full list of supported parameters.
    //
    // [0] https://stripe.com/docs/api/payment_intents/create
    
    const author = req.body.author.name
    const uid = req.body.author.id
    req.body.author = author
    req.body.uid = uid

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'INR',
            amount: 50,
            automatic_payment_methods: { enabled: true },
            metadata: { ...req.body }
        });

        // Send publishable key and PaymentIntent details to client
        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (e) {
        console.log(e)
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
});

module.exports = router;
