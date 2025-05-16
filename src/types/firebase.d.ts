/**
 * Custom type declarations for Firebase modules
 * This helps resolve TypeScript errors with Firebase imports
 */

// Fix for Firebase compat imports
declare module 'firebase/compat/app' {
  import firebase from 'firebase/app';
  export default firebase;
}

declare module 'firebase/compat/auth' {
  import { Auth } from 'firebase/auth';
  const auth: Auth;
  export default auth;
}

declare module 'firebase/compat/firestore' {
  import { Firestore } from 'firebase/firestore';
  const firestore: Firestore;
  export default firestore;
}

// Fix for Firebase firestore imports
declare module 'firebase/firestore' {
  export interface DocumentData {
    [key: string]: any;
  }
  
  export interface QueryDocumentSnapshot {
    id: string;
    data(): DocumentData;
    exists(): boolean;
  }
  
  export interface FirestoreDataConverter<T> {
    toFirestore(modelObject: T): DocumentData;
    fromFirestore(snapshot: QueryDocumentSnapshot): T;
  }
  
  export interface CollectionReference<T = DocumentData> {
    where(field: string, opStr: string, value: any): Query<T>;
    doc(documentPath?: string): DocumentReference<T>;
    add(data: T): Promise<DocumentReference<T>>;
  }
  
  export interface DocumentReference<T = DocumentData> {
    id: string;
    set(data: T): Promise<void>;
    update(data: Partial<T>): Promise<void>;
    delete(): Promise<void>;
    get(): Promise<DocumentSnapshot<T>>;
  }
  
  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T | undefined;
    exists: boolean;
  }
  
  export interface Query<T = DocumentData> {
    where(field: string, opStr: string, value: any): Query<T>;
    orderBy(field: string, directionStr?: 'asc' | 'desc'): Query<T>;
    limit(limit: number): Query<T>;
    get(): Promise<QuerySnapshot<T>>;
  }
  
  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot[];
    empty: boolean;
    size: number;
  }
  
  export function collection(firestore: Firestore, path: string): CollectionReference;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
  export function getDocs(query: Query): Promise<QuerySnapshot>;
  export function setDoc(reference: DocumentReference, data: any): Promise<void>;
  export function updateDoc(reference: DocumentReference, data: any): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function onSnapshot(reference: Query, onNext: (snapshot: QuerySnapshot) => void, onError?: (error: Error) => void): () => void;
}
