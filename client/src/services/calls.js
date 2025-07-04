import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const server_url = 'https://tubes-iot-production.up.railway.app/';

export const saveUserPreferences = async (prefs) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is logged in.');

  await setDoc(doc(db, 'users', user.uid), {
    preferences: prefs,
    updatedAt: new Date()
  }, { merge: true });
};

export const updateDevicesData = async (devices) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is logged in.');

  await updateDoc(doc(db, 'users', user.uid), {
    'preferences.devices': devices,
    updatedAt: new Date()
  });
};

export const getUserPreferences = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is logged in.');

  const docSnap = await getDoc(doc(db, 'users', user.uid));
  if (docSnap.exists()) {
    return docSnap.data().preferences || {};
  } else {
    return {};
  }
};

export const subscribeToUserPreferences = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is logged in.');
  }

  const userDocRef = doc(db, 'users', user.uid);

  const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.preferences || {});
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Error fetching user preferences in real-time:', error);
  });

  return unsubscribe;
};

export const sendDeviceIdToBackend = async (deviceId) => {
  const user = auth.currentUser;

  if (user && deviceId) {
    const idToken = await user.getIdToken();

    await fetch(server_url + 'api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ topicPrefix: 'data', deviceId: deviceId })
    });
  }
  else {
    console.warn("User unauthenticated or deviceId missing.");
  }
};

