import { onAuthStateChanged, User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function listenAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
export const logout = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem("cannedit_user")
  } catch (error) {
    console.error("Logout gagal:", error)
  }
}
