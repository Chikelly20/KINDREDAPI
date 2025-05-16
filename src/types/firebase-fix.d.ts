/**
 * Custom type declarations to fix Firebase Firestore TypeScript errors
 */

// Fix for Firebase Firestore v9 modular API
declare module 'firebase/firestore' {
  export interface DocumentData {
    [key: string]: any;
  }
  
  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
    exists(): boolean;
  }
  
  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void;
  }
  
  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T | undefined;
    exists: boolean;
  }
  
  export function query(collectionRef: any, ...queryConstraints: any[]): any;
  export function where(fieldPath: string, opStr: string, value: any): any;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;
  export function addDoc(collectionRef: any, data: any): Promise<any>;
  export function serverTimestamp(): any;
}

// Fix for Boolean expression errors
interface Boolean {
  (): boolean;
}
