export const saveAuth = (token, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
};

export const logout = () => {
  localStorage.clear();
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isLogin = () => {
  return !!localStorage.getItem("token");
};
