const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('../serviceAccountKey.json')

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();



const { Router } = require( "express")
const { Stripe } = require( "stripe")

const dotenv = require("dotenv")
dotenv.config();

const router = Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)


// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
router.post('/webhook', async (req, res) => {

    let data, eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly rom  the request body.
        data = req.body.data;
        eventType = req.body.type;
        console.log(data)
        console.log(eventType)
    }

    if (eventType === 'payment_intent.succeeded') {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log('💰 Payment captured!');
        console.log(data)


        const addPremiumToFirebase = async () => {
            try {

                // Add a new document with a generated id.
                console.log(data.object.metadata)
                const res = await db.collection('posts').add({
                    title: data.object.metadata.title,
                    postText: data.object.metadata.postText,
                    time: FieldValue.serverTimestamp(),
                    premium: true,
                    author: { id: data.object.metadata.uid, name: data.object.metadata.author }
                });


                console.log('Added document with ID: ', res.id);

            }
            catch (error) {
                console.log(error)
            }

        }
        addPremiumToFirebase();



    } else if (eventType === 'payment_intent.payment_failed') {
        console.log('❌ Payment failed.');
    }
    res.sendStatus(200);
});

module.exports = router;
