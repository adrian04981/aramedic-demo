import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserRole {
  uid: string;
  email: string;
  role: 'administrador' | 'administrador_medico' | 'medico';
  firstName: string;
  lastName: string;
  phone?: string;
  specialty?: string; // Para médicos
  licenseNumber?: string; // Para médicos
  profileImageUrl?: string | null; // URL de la foto de perfil
  signatureImageUrl?: string | null; // URL de la firma
  createdAt: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<UserRole | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  user$ = user(this.auth);

  constructor() {
    // Verificar si hay un usuario autenticado al inicializar
    this.user$.subscribe(async (user) => {
      if (user) {
        const userData = await this.getUserRole(user.uid);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async register(userData: Omit<UserRole, 'uid' | 'createdAt'> & { password: string }): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      );

      const userRole: UserRole = {
        uid: credential.user.uid,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        specialty: userData.specialty,
        licenseNumber: userData.licenseNumber,
        createdAt: new Date(),
        isActive: true
      };

      await setDoc(doc(this.firestore, 'users', credential.user.uid), userRole);
      this.currentUserSubject.next(userRole);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Intentar obtener los datos del usuario
      let userData = await this.getUserRole(credential.user.uid);
      
      // Si no existe el documento del usuario, crear uno básico
      if (!userData) {
        console.log('Usuario no encontrado en Firestore, creando documento básico...');
        
        // Determinar el rol basado en el email para usuarios de demo
        let role: 'administrador' | 'administrador_medico' | 'medico' = 'medico';
        let firstName = 'Usuario';
        let lastName = 'Demo';
        
        if (email === 'admin@aramedic.com') {
          role = 'administrador';
          firstName = 'Super';
          lastName = 'Administrador';
        } else if (email === 'adminmedico@aramedic.com') {
          role = 'administrador_medico';
          firstName = 'Dr. Carlos';
          lastName = 'Rodríguez';
        } else if (email === 'medico@aramedic.com') {
          role = 'medico';
          firstName = 'Dra. María';
          lastName = 'González';
        }
        
        userData = {
          uid: credential.user.uid,
          email: email,
          role: role,
          firstName: firstName,
          lastName: lastName,
          phone: '',
          createdAt: new Date(),
          isActive: true
        };

        // Solo agregar specialty y licenseNumber para médicos
        if (role === 'medico' || role === 'administrador_medico') {
          userData.specialty = 'Medicina General';
          userData.licenseNumber = 'MG-12345';
        }
        
        // Guardar el documento del usuario
        await setDoc(doc(this.firestore, 'users', credential.user.uid), userData);
      }
      
      if (userData && userData.isActive) {
        this.currentUserSubject.next(userData);
        this.router.navigate(['/dashboard']);
      } else {
        throw new Error('Usuario inactivo');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        return { ...userDoc.data() } as UserRole;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo rol de usuario:', error);
      return null;
    }
  }

  getCurrentUser(): UserRole | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? roles.includes(currentUser.role) : false;
  }

  canManageUsers(): boolean {
    return this.hasRole(['administrador', 'administrador_medico']);
  }

  async getAllUsers(): Promise<UserRole[]> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const snapshot = await getDocs(usersCollection);
      return snapshot.docs.map(doc => ({ ...doc.data() } as UserRole));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  async updateUserStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'users', uid), { isActive }, { merge: true });
    } catch (error) {
      console.error('Error actualizando estado de usuario:', error);
      throw error;
    }
  }

  async updateUser(uid: string, userData: Partial<UserRole>): Promise<void> {
    try {
      // No incluir campos undefined en la actualización
      const updateData: any = {};
      
      if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
      if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.profileImageUrl !== undefined) updateData.profileImageUrl = userData.profileImageUrl;
      if (userData.signatureImageUrl !== undefined) updateData.signatureImageUrl = userData.signatureImageUrl;
      
      // Solo agregar specialty y licenseNumber para roles médicos
      if (userData.role === 'medico' || userData.role === 'administrador_medico') {
        if (userData.specialty !== undefined) updateData.specialty = userData.specialty;
        if (userData.licenseNumber !== undefined) updateData.licenseNumber = userData.licenseNumber;
      }

      await setDoc(doc(this.firestore, 'users', uid), updateData, { merge: true });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }
}