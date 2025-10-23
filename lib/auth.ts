// lib/auth.ts
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Pantau perubahan user (login/logout)
export function listenAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Logout user
export const logout = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem("cannedit_user")
  } catch (error) {
    console.error("Logout gagal:", error)
  }
}

// ✅ REGISTER user baru + auto login
export const registerUser = async (formData: {
  name: string
  email: string
  password: string
}) => {
  try {
    // 1️⃣ Buat akun baru
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

    // 2️⃣ Update nama user (Firebase Auth)
    await updateProfile(userCredential.user, { displayName: formData.name })

    // 3️⃣ Simpan data user ke Firestore
    const userRef = doc(db, "users", userCredential.user.uid)
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      name: formData.name,
      email: formData.email,
      registeredAt: serverTimestamp(),
    })

    // 4️⃣ Firebase otomatis login-kan user
    return userCredential.user
  } catch (err) {
    console.error("Registration error:", err)
    throw new Error("Gagal mendaftar. Silakan coba lagi.")
  }
}

// ✅ LOGIN user dengan email & password
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update waktu login terakhir
    const userRef = doc(db, "users", user.uid)
    await setDoc(
      userRef,
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    )

    return user
  } catch (err) {
    console.error("Login error:", err)
    throw new Error("Gagal login. Silakan periksa email dan password Anda.")
  }
}
