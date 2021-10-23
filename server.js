var mysql = require("mysql")
var express = require("express")
var session = require("express-session")
var bodyParser = require("body-parser")
var path = require("path")
var cors = require("cors")

var app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodelogin",
})

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post("/add", function (request, response) {
  let username = request.body.username
  let password = request.body.password
  let email = request.body.email

  connection.query(
    "select count(email) as cnt from accounts where email = ?",
    [email],
    function (err, result) {
      console.log(result[0].cnt)
      if (result[0].cnt == 0) {
        connection.query(
          "INSERT INTO accounts (username, password, email) VALUES ( ?, ?, ?)",
          [username, password, email],
          function (err, secondResult) {
            if (err) console.log(err)
            else {
              console.log("Sign up successed")
              response.send(JSON.stringify({ msg: "Success" }))
            }
            // response.end()
          }
        )
      } else {
        console.log("This account is already existed!")
        response.send(JSON.stringify({ msg: "error" }))
      }
      // response.json("InsertNo")
      // response.end()
    }
  )
})

app.post("/auth", function (request, response) {
  // console.log(request.body)
  var username = request.body.username
  var password = request.body.password
  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true
          request.session.username = username
          response.redirect("/home")
        } else {
          console.log("This account does not existed!")
          response.send(JSON.stringify({ msg: "error" }))
        }
        response.end()
      }
    )
  } else {
    console.log("Please enter Username and Password!")
    response.send(JSON.stringify({ msg: "error1" }))
    response.end()
  }
})

app.get("/home", function (request, response) {
  if (request.session.loggedin) {
    response.send("Welcome back, " + request.session.username + "!")
  } else {
    console.log("Please login to view this page!")
    response.send(JSON.stringify({ msg: "success" }))
  }
  response.end()
})

app.listen(8080, function () {
  console.log("server running: 8080")
})
