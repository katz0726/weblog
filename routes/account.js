var { CONNECTION_URL, OPTIONS, DATABSE } = require("../config/mongodb.config");
var { authenticate, authorize } = require("../lib/security/accountcontrol.js");
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;
var tokens = new require("csrf")();

// Error messages
const URL_EMPTY_ERROR = "URLが未入力です。'/'から始まるURLを入力してください。";
const URL_FORM_ERROR = "'/'から始まるURLを入力してください。";
const TITLE_EMPTY_ERROR = "タイトルが未入力です。任意のタイトルを入力してください。";

// Validate a book form
var validateRegistData = function (body) {
  var isValidated = true, errors = {};

  // Check if URL is empty
  if (!body.url) {
    isValidated = false;
    errors.url = URL_EMPTY_ERROR;
  }

  // Check if URL format is wrong 
  if (body.url && /^\//.test(body.url) === false) {
    isValidated = false;
    errors.url = URL_FORM_ERROR;
  }

  // Check if title is empty
  if (!body.title) {
    isValidated = false;
    errors.title = TITLE_EMPTY_ERROR;
  }

  return isValidated ? undefined : errors;
};

var createRegistData = function (body) {
  var datetime = new Date();
  return {
    url: body.url,
    published: datetime,
    updated: datetime,
    title: body.title,
    content: body.content,
    keywords: (body.keywords || "").split(","),
    authors: (body.authors || "").split(","),
  };
};

// Show home page
router.get("/", authorize("readWrite"), (req, res) => {
  res.render("./account/index.ejs");
});

// Show Login page
router.get("/login", (req, res) => {
  res.render("./account/login.ejs", { message: req.flash("message") });
});

// Authenticate login user
router.post("/login", authenticate());

// Logout
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/account/login");
});

// Show Account page
router.get("/posts/regist", authorize("readWrite"), (req, res) => {
  tokens.secret((error, secret) => {
    var token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie("_csrf", token);
    res.render("./account/posts/regist-form.ejs");
  });
});

// Confirm posted data
router.post("/posts/regist/input", authorize("readWrite"), (req, res) => {
  var original = createRegistData(req.body);
  res.render("./account/posts/regist-form.ejs", { original });
});

// Show article confirmation page
router.post("/posts/regist/confirm", authorize("readWrite"), (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  res.render("./account/posts/regist-confirm.ejs", { original });
});

// Register an article
router.post("/posts/regist/execute", authorize("readWrite"), (req, res) => {
  var secret = req.session._csrf;
  var token = req.cookies._csrf;

  // Check if the posted token is the same as the generated token
  if (tokens.verify(secret, token) === false) {
    throw new Error("Invalid Token.");
  }
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }

  // Register a book form
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    db.collection("posts")
      .insertOne(original)
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");

        // To avoid resend article registration request, redirect article registeration complete page
        res.redirect("/account/posts/regist/complete");
      }).catch((error) => {
        throw error;
      }).then(() => {
        client.close();
      });
  });
});

// Show article registration completed page
router.get("/posts/regist/complete", authorize("readWrite"), (req, res) => {
  res.render("./account/posts/regist-complete.ejs");
});

module.exports = router;