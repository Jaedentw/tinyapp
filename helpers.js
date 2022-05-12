const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let c = 0; c <= 6; c++) {
    string += characters[Math.floor(Math.random() * characters.length)];
  }
  return string;
};

const checkEmails = (email, database) => {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return false;
    }
  }
  return true;
};

const findUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return database[user]['id'];
    }
  }
};

const urlsForUser = (userID, database) => {
  const userURLs = {};
  for (let shortURL in database) {
    if (database[shortURL]['userID'] === userID) {
      userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs;
};

module.exports = {urlsForUser, findUserByEmail, checkEmails, generateRandomString};