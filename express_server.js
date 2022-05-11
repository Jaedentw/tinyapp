const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});


//global objects
const urlDatabase = {
  shortURL: {
    longURL: 'longURL',
    userID: 'userID'
  }
};

const users = {
  'user': {
    id: 'user',
    email: 'jay@me.com',
    password: 'password',
  }
};

// const shortURL = req.params.shortURL;
// const user_id = req.cookies.user_id;
// const templateVars = {
//   shortURL: shortURL,
//   longURL: urlDatabase[shortURL]['longURL'],
//   username: users[user_id],
//   urls: urlDatabase,
//   user_id: user_id
//  };


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

const findUserByEmail = (email) => {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user]['id'];
    }
  }
  return false;
};

const urlsForUser = (userID) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
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
  const user_id = req.cookies.user_id;
  const templateVars = {
    username: users[user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const userURLs = urlsForUser(user_id);
  const templateVars = {
    shortURL: shortURL,
    username: users[user_id],
    urls: userURLs,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  const userURLs = urlsForUser(user_id);
  const templateVars = {
    shortURL: shortURL,
    longURL: userURLs[shortURL]['longURL'],
    username: users[user_id],
    urls: userURLs,
    user_id: user_id
  };
  if (user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send({Error: "You must be logged in and the creator of the specified URL to access this page."});
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.status(404).send({Error:"This link does not exist"});
  }
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


//posts
app.post("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  if (user_id) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send({Error: 'Please login to create new URLs'});
  }
});//submit button new

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  if (urlDatabase[shortURL]['userID'] === user_id) {
    delete urlDatabase[shortURL];
  } else {
    res.status(401).send({Error: "You are not permitted to delete this URL. Please register or log in to delete your URLs."});
  }
  res.redirect("/urls");
});//delete buttons index

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  if (urlDatabase[shortURL]['userID'] === user_id) {
    urlDatabase[shortURL]['longURL'] = req.body.newLongURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send({Error: "You are not permitted to edit this URL. Please register or log in to edit your URLs."});
  }
});//edit button show

app.post("/logins", (req, res) => {
  res.redirect('/login');
});//login button header

app.post("/registers", (req, res) => {
  res.redirect('/register');
});//register button header

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});//logout button header

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const {email, password } = req.body;
  if (email && password && checkEmails(email)) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    if (checkEmails(email)) {
      res.status(400).send({Error: 'please enter valid email and password'});
    } else {
      res.status(400).send({Error: 'This email is already registered'});
    }
  }
});//registration button on registration page + error handler

app.post("/login", (req, res) => {
  const {email, password } = req.body;
  if (checkEmails(email) === false) {
    const userID = findUserByEmail(email);
    const hashedPassword = users[userID]['password'];
    const isCorrectPass = bcrypt.compareSync(password, hashedPassword);
    if (email === users[userID]['email'] && isCorrectPass) {
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.status(403).send({Error: 'Email and password do not match'});
    }
  } else {
    res.status(403).send({Error: 'Email not registered'});
  }
});//login button on login page + error handling

