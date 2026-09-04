(function () {
  const token = localStorage.getItem("la-brioche-token");
  let user;
  try {
    user = JSON.parse(localStorage.getItem("la-brioche-user") || "null");
  } catch (error) {
    console.error(error);
    user = null;
  }
  const apiBase = "http://localhost:5000";
  const folderPrefix = /\/(additional(?:%20| )stuff|menus|cart(?:%20| )stuff)\//i.test(
    window.location.pathname,
  )
    ? "../"
    : "";
  let accountLink = document.querySelector(".account-link");
  if (!accountLink) {
    const actions = document.querySelector(".nav-actions");
    if (!actions) return;
    accountLink = document.createElement("a");
    accountLink.className = "back-link account-link";
    actions.append(accountLink);
  }

  function showLogin() {
    accountLink.href = `${folderPrefix}additional stuff/login.html`;
    accountLink.setAttribute("aria-label", "Log in or create an account");
    accountLink.innerHTML = "Log in";
  }

  function showProfile(profileUser) {
    accountLink.href = `${folderPrefix}profile.html`;
    accountLink.setAttribute("aria-label", "Your profile");
    accountLink.innerHTML = profileUser.profilePic
      ? `<img class="profile-avatar" src="${profileUser.profilePic}" alt="Your profile picture" />`
      : '<i class="fas fa-user-circle" aria-hidden="true"></i>';
  }

  if (!token || !user) {
    showLogin();
    return;
  }

  showProfile(user);
  fetch(`${apiBase}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Saved session is no longer valid.");
      return response.json();
    })
    .then((result) => {
      localStorage.setItem("la-brioche-user", JSON.stringify(result.user));
      showProfile(result.user);
    })
    .catch((error) => {
      console.error(error);
      localStorage.removeItem("la-brioche-token");
      localStorage.removeItem("la-brioche-user");
      showLogin();
    });
})();
