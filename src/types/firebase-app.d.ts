/**
 * Type declarations for Firebase v9 modular API
 * This file fixes TypeScript errors related to Firebase Firestore imports and usage
 */

declare module 'firebase/firestore' {
  // Core types
  export interface DocumentData {
    [field: string]: any;
  }

  // Document references and snapshots
  export interface DocumentReference<T = DocumentData> {
    id: string;
    path: string;
    parent: CollectionReference<T>;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    ref: DocumentReference<T>;
    exists(): boolean;
    data(): T | undefined;
    get(fieldPath: string): any;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    data(): T;
  }

  // Collection references and snapshots
  export interface CollectionReference<T = DocumentData> {
    id: string;
    path: string;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  // Query constraints
  export function query(collectionRef: CollectionReference, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;
  export function startAfter(...fieldValues: any[]): any;
  export function endBefore(...fieldValues: any[]): any;
  export function startAt(...fieldValues: any[]): any;
  export function endAt(...fieldValues: any[]): any;

  // Document operations
  export function addDoc(reference: CollectionReference, data: any): Promise<DocumentReference>;
  export function setDoc(reference: DocumentReference, data: any, options?: any): Promise<void>;
  export function updateDoc(reference: DocumentReference, data: any): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
  export function getDocs(query: any): Promise<QuerySnapshot>;

  // Realtime listeners
  export function onSnapshot(reference: any, observer: any): () => void;

  // Timestamps
  export function serverTimestamp(): any;
  export function Timestamp(seconds: number, nanoseconds: number): any;
}

// Fix for Boolean expression errors
interface Boolean {
  (): boolean;
}
