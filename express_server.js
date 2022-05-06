const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});


//global objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  'user': { 
    id: 'user',
    email: 'jay@me.com',
    password: '',
  }
}

  // const shortURL = req.params.shortURL;
  // const user_id = req.cookies.user_id;
  // const templateVars = { 
  //   shortURL: shortURL, 
  //   longURL: urlDatabase[shortURL], 
  //   username: users[user_id],
  //   urls: urlDatabase, 
  //   user_id: user_id 
  //  };


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
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL], 
    username: users[user_id],
    urls: urlDatabase,
    user_id: user_id};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL], 
    username: users[user_id],
    urls: urlDatabase,
    user_id: user_id};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL], 
    username: users[user_id],
    urls: urlDatabase,
    user_id: user_id};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {  
    username: users[user_id],
    user_id: user_id};
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {  
    username: users[user_id],
    user_id: user_id};
  res.render("login", templateVars);
});


//functions
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let c = 0; c <= 6; c++) {
    string += characters[Math.floor(Math.random() * characters.length)];
  }
  return string;
};

const checkEmails = (email) => {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return false;
    }
  }
  return true;
};


//posts
app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});//submit button new

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});//delete buttons index

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${shortURL}`);
});//edit button show

app.post("/logins", (req, res) => {
  res.redirect('/login');
});//login button header

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});//logout button header

app.post("/registers", (req, res) => {
  res.redirect('/register');
})//register button header

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const {email, password }= req.body;
  if (email && password && checkEmails(email)) {
    users[userID] = { 
      id: userID, 
      email: email, 
      password: password
    };
    res.cookie('user_id', {userID, email, password});
    res.redirect('/urls');
  } else {
    if (checkEmails(email)) {
      res.status(400).send({Error: 'please enter valid email and password'});
    } else {
      res.status(400).send({Error: 'This email is already registered'})
    }
  }
})

