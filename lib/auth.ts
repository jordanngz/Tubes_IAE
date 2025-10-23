import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { hash } from "bcryptjs"

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

export const registerUser = async (formData: {
  name: string
  email: string
  password: string
}) => {
  try {
    // Hash the password before storing it
    const hashedPassword = await hash(formData.password, 10)

    const userRef = doc(db, "users", formData.email)
    await setDoc(userRef, {
      name: formData.name,
      email: formData.email,
      password: hashedPassword, // Store the hashed password
      registeredAt: serverTimestamp(),
    })

    // Use the plain password for authentication
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
    return userCredential.user
  } catch (err) {
    console.error("Registration error:", err)
    throw new Error("Gagal mendaftar. Silakan coba lagi.")
  }
}
