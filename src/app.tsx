// PRIVATE_FIXED/src/app/App.tsx
export const saveAuth = (token: string, role: string) => {
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
