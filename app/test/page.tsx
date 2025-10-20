// Ngetes firebase firestore 

"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function TestPage() {
  useEffect(() => {
    const run = async () => {
      await addDoc(collection(db, "users"), {
        name: "Peter Cetera",
        email: "Cetera@example.com",
      });
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    };

    run();
  }, []);

  return <h1 className="text-xl font-bold">Test Firestore 🚀</h1>;
}
