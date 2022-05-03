const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//gets
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls : urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const shorty = req.params.shortURL;
  const templateVars = { shortURL: shorty, longURL: urlDatabase[shorty] };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const shorty = req.params.shortURL;
  const longURL = urlDatabase[shorty];
  res.redirect(longURL);
});


//functions
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let c = 0; c <= 6; c++) {
    string += characters[Math.floor(Math.random() * characters.length)]
  }
  return string;
}


//posts
app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});//submit button

app.post("/urls/:shortURL/delete", (req, res) => {
  const shorty = req.params.shortURL;
  delete urlDatabase[shorty];
  res.redirect("/urls");
});//delete buttons

app.post("/urls/:shortURL", (req, res) => {
  const shorty = req.params.shortURL;
  urlDatabase[shorty] = req.body.newLongURL;
  res.redirect(`/urls/${shorty}`)
});//edit button

