// Pagkuha lang to ng user data sa localstorage
// Naka json format

export function FetchCurrentUser() {
  try {
    const localStorageUserData = localStorage.getItem("user");
    return localStorageUserData ? JSON.parse(localStorageUserData) : null;
  } catch (err) {
    console.error("Error parsing user from localStorage:", err);
    return null;
  }
}
