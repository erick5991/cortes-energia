import { Injectable, computed, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

import { auth, firestore } from '../firebase';
import type { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseUser = signal<User | null>(null);
  private readonly usuarioActual = signal<Usuario | null>(null);
  private readonly cargandoSesion = signal(true);
  private readonly cargandoPerfil = signal(false);
  private detenerEscuchaUsuario: Unsubscribe | null = null;

  readonly user = this.firebaseUser.asReadonly();
  readonly usuario = this.usuarioActual.asReadonly();
  readonly cargando = this.cargandoSesion.asReadonly();
  readonly estaAutenticado = computed(() => this.firebaseUser() !== null);
  readonly esAdmin = computed(() => this.usuarioActual()?.role === 'admin');

  /** true hasta que se resuelve tanto el estado de Firebase Auth como el doc usuarios/{uid} (del que depende esAdmin). */
  readonly resolviendoSesion = computed(() => this.cargandoSesion() || this.cargandoPerfil());

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.firebaseUser.set(user);
      this.escucharUsuario(user);
      this.cargandoSesion.set(false);
    });
  }

  private escucharUsuario(user: User | null): void {
    this.detenerEscuchaUsuario?.();
    this.detenerEscuchaUsuario = null;
    this.usuarioActual.set(null);

    if (!user) {
      this.cargandoPerfil.set(false);
      return;
    }

    this.cargandoPerfil.set(true);
    this.detenerEscuchaUsuario = onSnapshot(doc(firestore, 'usuarios', user.uid), (snapshot) => {
      this.usuarioActual.set(
        snapshot.exists() ? ({ uid: user.uid, ...snapshot.data() } as Usuario) : null,
      );
      this.cargandoPerfil.set(false);
    });
  }

  async iniciarSesionConGoogle(): Promise<void> {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async iniciarSesionAdmin(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async cerrarSesion(): Promise<void> {
    await signOut(auth);
  }
}
