const form = document.getElementById("createAccount");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  document.querySelectorAll(".error").forEach((element) => {
    element.innerHTML = "";
  });
  
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById(
    "signupConfirmPassword"
  ).value;
  console.log(
    "Email: " +
      email +
      " Password: " +
      password +
      " Confirm Password: " +
      confirmPassword +
      "Username" +
      username
  );
  const isValid = true;
  if (!email || !email.includes("@citchennai.net")) {
    document.getElementById("email-error-message").innerHTML =
      "Email is not associated with CIT";
    isValid = false;
  } else if (!username || username.length < 3) {
    document.getElementById("username-error-message").innerHTML =
      "Username is too short";
    isValid = false;
  } else if (!password || password.length < 6) {
    document.getElementById("password-error-message").innerHTML =
      "Password is too short";
    isValid = false;
  } else if (confirmPassword != password || !confirmPassword) {
    document.getElementById("confirm-password-error-message").innerHTML =
      "Passwords do not match";
    isValid = false;
  }
  if (isValid) {
    const formData = new FormData(form);
    try {
      await fetch("/register/submit");
    } catch (e) {
      console.log(e);
    }
  }
  form.submit();
  // Handle the response from the server
  console.log("test");
});
