export const authService = {
  login: (username: string, password: string) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1500)
    ),

  recoverPassword: (email: string) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1500)
    ),

  updateUser: (data: any) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1500)
    ),
};