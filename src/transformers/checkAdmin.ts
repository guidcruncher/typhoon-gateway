// src/transformers/checkAdmin.ts

export const checkAdmin = {
  name: "checkAdmin",

  async onRequest(req: any) {
    const user = req.user
    if (!user || user.role !== "admin") {
      throw new Error("Admin privileges required")
    }
  },
}
