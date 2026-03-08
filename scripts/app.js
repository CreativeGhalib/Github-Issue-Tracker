//adding adlistener to the sign in button
document.getElementById('signin-btn').addEventListener('click', function (event) {
  event.preventDefault();
  const usernameInput = document.getElementById('input-username');
  const userNameValue = usernameInput.value;

  const passwordInput = document.getElementById('input-password');
  const passwordValue = passwordInput.value;
  console.log(userNameValue, passwordValue);
  if (userNameValue == 'admin' && passwordValue == 'admin123') {
    alert('Login successful!');
    window.location.assign('home.html');//eta korichi jate login successful hole home page e chole jay jeno
  } else {
    alert('Invalid username or password. Please try again.');
  }

  //get the mobile number and password using values of the input and then we will check the conditions of password and mobile number , whether they are true or not and based on that boolean value i will show them alert message of success or failure
});
