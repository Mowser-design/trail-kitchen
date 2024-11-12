import { 
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Trip, FoodItem } from '../types';

const getUserTripsCollection = () => collection(db, `users/${auth.currentUser?.uid}/trips`);
const getUserFoodItemsCollection = () => collection(db, `users/${auth.currentUser?.uid}/foodItems`);

export const saveTrip = async (trip: Trip) => {
  if (!auth.currentUser) return;
  await setDoc(doc(getUserTripsCollection(), trip.id), trip);
};

export const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
  if (!auth.currentUser) return;
  await updateDoc(doc(getUserTripsCollection(), tripId), updates);
};

export const deleteTrip = async (tripId: string) => {
  if (!auth.currentUser) return;
  await deleteDoc(doc(getUserTripsCollection(), tripId));
};

export const saveFoodItem = async (item: FoodItem) => {
  if (!auth.currentUser) return;
  await setDoc(doc(getUserFoodItemsCollection(), item.id), item);
};

export const updateFoodItem = async (itemId: string, updates: Partial<FoodItem>) => {
  if (!auth.currentUser) return;
  await updateDoc(doc(getUserFoodItemsCollection(), itemId), updates);
};

export const deleteFoodItem = async (itemId: string) => {
  if (!auth.currentUser) return;
  await deleteDoc(doc(getUserFoodItemsCollection(), itemId));
};

export const subscribeToTrips = (callback: (trips: Trip[]) => void) => {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  
  return onSnapshot(getUserTripsCollection(), (snapshot) => {
    const trips = snapshot.docs.map(doc => doc.data() as Trip);
    callback(trips);
  });
};

export const subscribeToFoodItems = (callback: (items: FoodItem[]) => void) => {
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }

  return onSnapshot(getUserFoodItemsCollection(), (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as FoodItem);
    callback(items);
  });
};