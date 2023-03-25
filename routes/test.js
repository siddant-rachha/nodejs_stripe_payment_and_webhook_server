const { Router } = require("express")

const router = Router();

router.get("/test", (req, res) => {
    res.send("SERVER IS RUNNING")
})

module.exports = router