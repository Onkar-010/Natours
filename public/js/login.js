/** @format */

const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    console.log(res.data.status);
    if (res.data.status === "success") {
      alert("Logged in");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    console.log(res);
  } catch (err) {
    alert(err.response.data.message);
  }
};
if (document.querySelector(".login-form")) {
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:3000/api/v1/users/logout",
    });
    console.log(res);
    if (res.data.status === "success") location.reload(true);
  } catch (err) {
    console.log(err.response);
    alert("Error logging out! Try again.");
  }
};
document.querySelector(".nav__el--logout").addEventListener("click", logout);
