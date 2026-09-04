(function () {
  const token = localStorage.getItem("la-brioche-token");
  const user = JSON.parse(localStorage.getItem("la-brioche-user") || "null");
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

  if (!token || !user) {
    accountLink.href = `${folderPrefix}additional stuff/login.html`;
    accountLink.setAttribute("aria-label", "Log in or create an account");
    accountLink.innerHTML = "Log in";
    return;
  }

  accountLink.href = `${folderPrefix}profile.html`;
  accountLink.setAttribute("aria-label", "Your profile");
  accountLink.innerHTML = user.profilePic
    ? `<img class="profile-avatar" src="${user.profilePic}" alt="Your profile picture" />`
    : '<i class="fas fa-user-circle" aria-hidden="true"></i>';
})();
