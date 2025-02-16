export const checkEnvironment = () => {
  const isLocalhost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );
  localStorage.setItem("isLocalhost", JSON.stringify(isLocalhost));
};
