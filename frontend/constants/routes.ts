export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  BOOKING: (id: string) => `/booking/${id}`,
} as const;
