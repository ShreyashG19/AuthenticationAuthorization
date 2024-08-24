const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    console.log("new request");
    res.render("index");
});
app.post("/create", async (req, res) => {
    const { username, email, password, age } = req.body;

    bcrypt.hash(password, 10, async (err, hash) => {
        const createdUser = await userModel.create({
            username,
            email,
            password: hash,
            age,
        });

        const token = jwt.sign({ email }, "ayein");

        res.cookie("token", token);
        res.send(createdUser);
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) res.redirect("login");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            const token = jwt.sign({ email }, "ayein");
            res.cookie("token", token);
            res.send("you are authenticated");
        } else {
            res.send("something went wrong");
        }
    });
});

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});
app.listen(8000, () => {
    console.log("listening on 8000");
});
