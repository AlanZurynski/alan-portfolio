let users = [
  { username: "admin", password: "1234" },
  { username: "admin2", password: "abcd" }
];

const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const userError = document.getElementById("userError");
const passError = document.getElementById("passError");

form.addEventListener("submit", function(e){
  e.preventDefault();

  const found = users.find(u => u.username === username.value && u.password === password.value);

  if(found){
    window.location.href = "dashboard.html";
  } else {
    passError.textContent = "Gebruikersnaam of wachtwoord klopt niet!";
  }
});