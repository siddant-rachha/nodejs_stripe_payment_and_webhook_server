const express = require("express")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")
const cors = require("cors")

dotenv.config();
//route imports
const testRoute = require('./routes/test.js')
const paymentRoute = require('./routes/payment.js')
const webhookRoute = require('./routes/webhook.js')



const app = express();

app.use(cors());

const jsonParser = bodyParser.json();
app.use(jsonParser)


app.use("/", testRoute);
app.use("/", paymentRoute);


app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith('/webhook')) {
                req.rawBody = buf.toString();
            }
        },
    })
);
app.use("/", webhookRoute)



//server listen
app.listen(process.env.PORT || 5000, () => {
    console.log("server is running")
})