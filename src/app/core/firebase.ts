import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const firebaseApp = initializeApp(environment.firebase);

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

/** Envuelve una query de Firestore en un Observable que emite en cada cambio en tiempo real. */
export function fromCollection<T>(query: Query<DocumentData>): Observable<T[]> {
  return new Observable<T[]>((subscriber) => {
    return onSnapshot(
      query,
      (snapshot) => subscriber.next(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
      (error) => subscriber.error(error),
    );
  });
}
