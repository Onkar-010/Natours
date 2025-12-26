/** @format */
const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updatePassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "sucess" || res.data.status === "success") {
      alert(`${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

if (document.querySelector(".form-user-data"))
  document.querySelector(".form-user-data").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    updateSettings({ name, email }, "data");
  });

if (document.querySelector(".form-user-password"))
  document
    .querySelector(".form-user-password")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document.querySelector(".btn--save-password").textContent = "Updating...";

      const currPassword = document.getElementById("password-current").value;
      const newPassword = document.getElementById("password").value;
      const confirmPassword = document.getElementById("password-confirm").value;
      await updateSettings(
        { currPassword, newPassword, confirmPassword },
        "password"
      );

      document.querySelector(".btn--save-password").textContent =
        "Save password";
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    });
