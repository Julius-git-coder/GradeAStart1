// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
// } from "firebase/auth";
// import {
//   getFirestore,
//   doc,
//   setDoc,
//   getDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   onSnapshot,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   serverTimestamp,
//   increment,
//   orderBy,
//   limit,
// } from "firebase/firestore";
// import { initializeApp } from "firebase/app";

// // Your Firebase config (from FirebaseConfig.js)
// const firebaseConfig = {
//   apiKey: "AIzaSyAsINOQJO-JZBxLfOTZebbIX-b8AAvLMx0",
//   authDomain: "gradea-16e92.firebaseapp.com",
//   databaseURL: "https://gradea-16e92-default-rtdb.firebaseio.com",
//   projectId: "gradea-16e92",
//   storageBucket: "gradea-16e92.firebasestorage.app",
//   messagingSenderId: "997063193649",
//   appId: "1:997063193649:web:3cd18734390b80982d1110",
//   measurementId: "G-PJSBKFP1Y9",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// // ============================================
// // AUTHENTICATION FUNCTIONS
// // ============================================

// export const signUpAdmin = async (adminData) => {
//   try {
//     const { email, password, fullName, phone, department, teamId } = adminData;

//     // Check if team ID already exists
//     const teamRef = doc(db, "teams", teamId);
//     const teamDoc = await getDoc(teamRef);

//     if (teamDoc.exists()) {
//       throw new Error("Team ID already exists. Please choose a different one.");
//     }

//     // Create auth user
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const user = userCredential.user;

//     // Create user document in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       uid: user.uid,
//       email,
//       fullName,
//       phone,
//       department,
//       role: "admin",
//       teamId,
//       studentCount: 0,
//       createdAt: serverTimestamp(),
//     });

//     // Create team document
//     await setDoc(doc(db, "teams", teamId), {
//       teamId,
//       adminId: user.uid,
//       adminName: fullName,
//       adminEmail: email,
//       studentCount: 0,
//       isActive: true,
//       createdAt: serverTimestamp(),
//     });

//     return { success: true, userId: user.uid };
//   } catch (error) {
//     console.error("Error signing up admin:", error);
//     throw error;
//   }
// };

// export const signUpStudent = async (studentData) => {
//   try {
//     const { email, password, fullName, phone, studentId, teamId } = studentData;

//     // Verify team ID exists
//     const teamRef = doc(db, "teams", teamId);
//     const teamDoc = await getDoc(teamRef);

//     if (!teamDoc.exists()) {
//       throw new Error("Invalid Team ID. This team does not exist.");
//     }

//     const teamData = teamDoc.data();

//     if (!teamData.isActive) {
//       throw new Error(
//         "This team is no longer active. Contact your administrator."
//       );
//     }

//     // Create auth user
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const user = userCredential.user;

//     // Create user document in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       uid: user.uid,
//       email,
//       fullName,
//       phone,
//       studentId,
//       role: "student",
//       teamId,
//       createdAt: serverTimestamp(),
//     });

//     // Increment student count in team
//     await updateDoc(teamRef, {
//       studentCount: increment(1),
//     });

//     // Increment student count in admin's user doc
//     const adminUserRef = doc(db, "users", teamData.adminId);
//     await updateDoc(adminUserRef, {
//       studentCount: increment(1),
//     });

//     return { success: true, userId: user.uid };
//   } catch (error) {
//     console.error("Error signing up student:", error);
//     throw error;
//   }
// };

// export const signIn = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const user = userCredential.user;

//     // Get user data from Firestore
//     const userDoc = await getDoc(doc(db, "users", user.uid));

//     if (!userDoc.exists()) {
//       throw new Error("User data not found");
//     }

//     return {
//       success: true,
//       user: user,
//       userData: userDoc.data(),
//     };
//   } catch (error) {
//     console.error("Error signing in:", error);
//     throw error;
//   }
// };

// export const signOut = async () => {
//   try {
//     await firebaseSignOut(auth);
//     return { success: true };
//   } catch (error) {
//     console.error("Error signing out:", error);
//     throw error;
//   }
// };

// // ============================================
// // USER FUNCTIONS
// // ============================================

// export const getCurrentUser = () => {
//   return auth.currentUser;
// };

// export const getUserData = async (userId) => {
//   try {
//     const userDoc = await getDoc(doc(db, "users", userId));
//     if (userDoc.exists()) {
//       return userDoc.data();
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting user data:", error);
//     throw error;
//   }
// };

// export const getStudentsByTeam = async (teamId) => {
//   try {
//     const q = query(
//       collection(db, "users"),
//       where("teamId", "==", teamId),
//       where("role", "==", "student")
//     );

//     const querySnapshot = await getDocs(q);
//     const students = [];
//     querySnapshot.forEach((doc) => {
//       students.push({ id: doc.id, ...doc.data() });
//     });

//     return students;
//   } catch (error) {
//     console.error("Error getting students:", error);
//     throw error;
//   }
// };

// // ============================================
// // ANNOUNCEMENTS FUNCTIONS
// // ============================================

// export const createAnnouncement = async (announcementData) => {
//   try {
//     const user = getCurrentUser();
//     if (!user) throw new Error("User not authenticated");

//     const userData = await getUserData(user.uid);
//     if (userData.role !== "admin") {
//       throw new Error("Only admins can create announcements");
//     }

//     const docRef = await addDoc(collection(db, "announcements"), {
//       ...announcementData,
//       teamId: userData.teamId,
//       adminId: user.uid,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     });

//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error("Error creating announcement:", error);
//     throw error;
//   }
// };

// export const getAnnouncements = async (teamId) => {
//   try {
//     const q = query(
//       collection(db, "announcements"),
//       where("teamId", "==", teamId),
//       orderBy("createdAt", "desc")
//     );

//     const querySnapshot = await getDocs(q);
//     const announcements = [];
//     querySnapshot.forEach((doc) => {
//       announcements.push({ id: doc.id, ...doc.data() });
//     });

//     return announcements;
//   } catch (error) {
//     console.error("Error getting announcements:", error);
//     throw error;
//   }
// };

// export const subscribeToAnnouncements = (teamId, callback) => {
//   const q = query(
//     collection(db, "announcements"),
//     where("teamId", "==", teamId),
//     orderBy("createdAt", "desc")
//   );

//   return onSnapshot(q, (snapshot) => {
//     const announcements = [];
//     snapshot.forEach((doc) => {
//       announcements.push({ id: doc.id, ...doc.data() });
//     });
//     callback(announcements);
//   });
// };

// export const updateAnnouncement = async (announcementId, data) => {
//   try {
//     await updateDoc(doc(db, "announcements", announcementId), {
//       ...data,
//       updatedAt: serverTimestamp(),
//     });
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating announcement:", error);
//     throw error;
//   }
// };

// export const deleteAnnouncement = async (announcementId) => {
//   try {
//     await deleteDoc(doc(db, "announcements", announcementId));
//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting announcement:", error);
//     throw error;
//   }
// };

// // ============================================
// // ASSIGNMENTS FUNCTIONS
// // ============================================

// export const createAssignment = async (assignmentData) => {
//   try {
//     const user = getCurrentUser();
//     if (!user) throw new Error("User not authenticated");

//     const userData = await getUserData(user.uid);
//     if (userData.role !== "admin") {
//       throw new Error("Only admins can create assignments");
//     }

//     const docRef = await addDoc(collection(db, "assignments"), {
//       ...assignmentData,
//       teamId: userData.teamId,
//       adminId: user.uid,
//       status: "active",
//       createdAt: serverTimestamp(),
//     });

//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error("Error creating assignment:", error);
//     throw error;
//   }
// };

// export const getAssignments = async (teamId) => {
//   try {
//     const q = query(
//       collection(db, "assignments"),
//       where("teamId", "==", teamId),
//       where("status", "==", "active"),
//       orderBy("createdAt", "desc")
//     );

//     const querySnapshot = await getDocs(q);
//     const assignments = [];
//     querySnapshot.forEach((doc) => {
//       assignments.push({ id: doc.id, ...doc.data() });
//     });

//     return assignments;
//   } catch (error) {
//     console.error("Error getting assignments:", error);
//     throw error;
//   }
// };

// export const subscribeToAssignments = (teamId, callback) => {
//   const q = query(
//     collection(db, "assignments"),
//     where("teamId", "==", teamId),
//     where("status", "==", "active"),
//     orderBy("createdAt", "desc")
//   );

//   return onSnapshot(q, (snapshot) => {
//     const assignments = [];
//     snapshot.forEach((doc) => {
//       assignments.push({ id: doc.id, ...doc.data() });
//     });
//     callback(assignments);
//   });
// };

// // ============================================
// // ATTENDANCE FUNCTIONS
// // ============================================

// export const createAttendance = async (attendanceData) => {
//   try {
//     const user = getCurrentUser();
//     if (!user) throw new Error("User not authenticated");

//     const userData = await getUserData(user.uid);
//     if (userData.role !== "admin") {
//       throw new Error("Only admins can create attendance records");
//     }

//     const docRef = await addDoc(collection(db, "attendance"), {
//       ...attendanceData,
//       teamId: userData.teamId,
//       adminId: user.uid,
//       createdAt: serverTimestamp(),
//     });

//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error("Error creating attendance:", error);
//     throw error;
//   }
// };

// export const getAttendanceRecords = async (teamId) => {
//   try {
//     const q = query(
//       collection(db, "attendance"),
//       where("teamId", "==", teamId),
//       orderBy("date", "desc")
//     );

//     const querySnapshot = await getDocs(q);
//     const records = [];
//     querySnapshot.forEach((doc) => {
//       records.push({ id: doc.id, ...doc.data() });
//     });

//     return records;
//   } catch (error) {
//     console.error("Error getting attendance records:", error);
//     throw error;
//   }
// };

// export { auth, db };
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAsINOQJO-JZBxLfOTZebbIX-b8AAvLMx0",
  authDomain: "gradea-16e92.firebaseapp.com",
  databaseURL: "https://gradea-16e92-default-rtdb.firebaseio.com",
  projectId: "gradea-16e92",
  storageBucket: "gradea-16e92.firebasestorage.app",
  messagingSenderId: "997063193649",
  appId: "1:997063193649:web:3cd18734390b80982d1110",
  measurementId: "G-PJSBKFP1Y9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export const signUpAdmin = async (adminData) => {
  try {
    const { email, password, fullName, phone, department, teamId } = adminData;

    // Check if team ID already exists
    const teamRef = doc(db, "teams", teamId);
    const teamDoc = await getDoc(teamRef);

    if (teamDoc.exists()) {
      throw new Error("Team ID already exists. Please choose a different one.");
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      fullName,
      phone,
      department,
      role: "admin",
      teamId,
      studentCount: 0,
      createdAt: serverTimestamp(),
    });

    // Create team document
    await setDoc(doc(db, "teams", teamId), {
      teamId,
      adminId: user.uid,
      adminName: fullName,
      adminEmail: email,
      studentCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error signing up admin:", error);
    throw error;
  }
};

export const signUpStudent = async (studentData) => {
  try {
    const { email, password, fullName, phone, studentId, teamId } = studentData;

    // Verify team ID exists
    const teamRef = doc(db, "teams", teamId);
    const teamDoc = await getDoc(teamRef);

    if (!teamDoc.exists()) {
      throw new Error("Invalid Team ID. This team does not exist.");
    }

    const teamData = teamDoc.data();

    if (!teamData.isActive) {
      throw new Error(
        "This team is no longer active. Contact your administrator."
      );
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      fullName,
      phone,
      studentId,
      role: "student",
      teamId,
      adminId: teamData.adminId, // IMPORTANT: Store admin ID for reference
      createdAt: serverTimestamp(),
    });

    // Increment student count in team
    await updateDoc(teamRef, {
      studentCount: increment(1),
    });

    // Increment student count in admin's user doc
    const adminUserRef = doc(db, "users", teamData.adminId);
    await updateDoc(adminUserRef, {
      studentCount: increment(1),
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error signing up student:", error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      throw new Error("User data not found");
    }

    return {
      success: true,
      user: user,
      userData: userDoc.data(),
    };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// ============================================
// USER FUNCTIONS
// ============================================

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const getStudentsByTeam = async (teamId) => {
  try {
    const q = query(
      collection(db, "users"),
      where("teamId", "==", teamId),
      where("role", "==", "student")
    );

    const querySnapshot = await getDocs(q);
    const students = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    return students;
  } catch (error) {
    console.error("Error getting students:", error);
    throw error;
  }
};

// ============================================
// ANNOUNCEMENTS FUNCTIONS
// ============================================

export const createAnnouncement = async (announcementData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const userData = await getUserData(user.uid);
    if (userData.role !== "admin") {
      throw new Error("Only admins can create announcements");
    }

    const docRef = await addDoc(collection(db, "announcements"), {
      ...announcementData,
      teamId: userData.teamId,
      adminId: user.uid,
      adminName: userData.fullName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(
      "Announcement created:",
      docRef.id,
      "for team:",
      userData.teamId
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const getAnnouncements = async (teamId) => {
  try {
    const q = query(
      collection(db, "announcements"),
      where("teamId", "==", teamId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });

    return announcements;
  } catch (error) {
    console.error("Error getting announcements:", error);
    throw error;
  }
};

export const subscribeToAnnouncements = (teamId, callback, onError) => {
  console.log("Subscribing to announcements for team:", teamId);

  const q = query(
    collection(db, "announcements"),
    where("teamId", "==", teamId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log(
        "Announcements snapshot received:",
        snapshot.size,
        "documents"
      );
      const announcements = [];
      snapshot.forEach((doc) => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      callback(announcements);
    },
    (error) => {
      console.error("Error in announcements listener:", error);
      if (onError) onError(error);
    }
  );
};

export const updateAnnouncement = async (announcementId, data) => {
  try {
    await updateDoc(doc(db, "announcements", announcementId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    await deleteDoc(doc(db, "announcements", announcementId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// ============================================
// ASSIGNMENTS FUNCTIONS
// ============================================

export const createAssignment = async (assignmentData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const userData = await getUserData(user.uid);
    if (userData.role !== "admin") {
      throw new Error("Only admins can create assignments");
    }

    const docRef = await addDoc(collection(db, "assignments"), {
      ...assignmentData,
      teamId: userData.teamId,
      adminId: user.uid,
      adminName: userData.fullName,
      status: "active",
      createdAt: serverTimestamp(),
    });

    console.log("Assignment created:", docRef.id, "for team:", userData.teamId);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

export const getAssignments = async (teamId) => {
  try {
    const q = query(
      collection(db, "assignments"),
      where("teamId", "==", teamId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const assignments = [];
    querySnapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });

    return assignments;
  } catch (error) {
    console.error("Error getting assignments:", error);
    throw error;
  }
};

export const subscribeToAssignments = (teamId, callback, onError) => {
  console.log("Subscribing to assignments for team:", teamId);

  const q = query(
    collection(db, "assignments"),
    where("teamId", "==", teamId),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("Assignments snapshot received:", snapshot.size, "documents");
      const assignments = [];
      snapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
      });
      callback(assignments);
    },
    (error) => {
      console.error("Error in assignments listener:", error);
      if (onError) onError(error);
    }
  );
};

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

export const createAttendance = async (attendanceData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const userData = await getUserData(user.uid);
    if (userData.role !== "admin") {
      throw new Error("Only admins can create attendance records");
    }

    const docRef = await addDoc(collection(db, "attendance"), {
      ...attendanceData,
      teamId: userData.teamId,
      adminId: user.uid,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
};

export const getAttendanceRecords = async (teamId) => {
  try {
    const q = query(
      collection(db, "attendance"),
      where("teamId", "==", teamId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });

    return records;
  } catch (error) {
    console.error("Error getting attendance records:", error);
    throw error;
  }
};

export { auth, db };