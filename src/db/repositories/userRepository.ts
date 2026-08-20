import { UserDoc, UserRole } from '../../types/firestore';
import { User } from '../../types/user';
import { db as localDb } from '../database';
import { validateEmail, validateRequiredString, validateRole } from '../validation';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const USERS_COLLECTION = 'users';

function useLocalUserStore(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

function toUserDoc(user: User): UserDoc & { companyName?: string | null } {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    displayName: user.fullName,
    companyName: user.companyName,
    role: user.role as UserRole,
    status: (user as User & { status?: UserDoc['status'] }).status || 'ACTIVE',
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function getLocalUserById(id: string): UserDoc | null {
  const user = localDb.getRaw().users.find((item) => item.id === id || item.userId === id);
  return user ? toUserDoc(user) : null;
}

function getLocalUserByEmail(email: string): UserDoc | null {
  const user = localDb.getRaw().users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  return user ? toUserDoc(user) : null;
}

export async function getUserById(id: string): Promise<UserDoc | null> {
  if (!id) return null;
  if (useLocalUserStore()) return getLocalUserById(id);

  const snap = await getAdminFirestore().collection(USERS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as UserDoc;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  const cleanEmail = validateEmail(email);
  if (useLocalUserStore()) return getLocalUserByEmail(cleanEmail);

  const snap = await getAdminFirestore()
    .collection(USERS_COLLECTION)
    .where('email', '==', cleanEmail)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as UserDoc;
}

export async function createUser(data: Omit<UserDoc, 'createdAt' | 'updatedAt'>): Promise<UserDoc> {
  const id = validateRequiredString(data.id, 'id');
  const email = validateEmail(data.email);
  const displayName = validateRequiredString(data.displayName, 'displayName');
  const role = validateRole(data.role);
  const status = data.status || 'ACTIVE';

  const now = new Date().toISOString();
  const newUser: UserDoc = {
    ...data,
    id,
    email,
    displayName,
    role,
    status,
    createdAt: now,
    updatedAt: now,
  };

  if (useLocalUserStore()) {
    const store = localDb.getRaw();
    store.users.push({
      id,
      email,
      fullName: displayName,
      phone: data.phone || '',
      role,
      passwordHash: data.passwordHash,
      createdAt: now,
      updatedAt: now,
    } as User);
    localDb.save();
    return newUser;
  }

  await getAdminFirestore().collection(USERS_COLLECTION).doc(id).set(newUser);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<UserDoc>): Promise<UserDoc> {
  const existing = await getUserById(id);
  if (!existing) {
    throw new Error(`User with ID ${id} not found.`);
  }

  const now = new Date().toISOString();
  const payload: Record<string, unknown> = { ...updates, updatedAt: now };

  if (updates.email) payload.email = validateEmail(updates.email);
  if (updates.role) payload.role = validateRole(updates.role);

  if (useLocalUserStore()) {
    const data = localDb.getRaw();
    const index = data.users.findIndex((item) => item.id === id || item.userId === id);
    if (index === -1) throw new Error(`User with ID ${id} not found.`);

    data.users[index] = {
      ...data.users[index],
      ...(payload.email ? { email: payload.email as string } : {}),
      ...(payload.displayName ? { fullName: payload.displayName as string } : {}),
      ...(payload.phone ? { phone: payload.phone as string } : {}),
      ...(payload.companyName !== undefined ? { companyName: payload.companyName as string } : {}),
      ...(payload.role ? { role: payload.role as User['role'] } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      updatedAt: now,
    } as User;
    localDb.save();
    return { ...existing, ...payload, updatedAt: now } as UserDoc;
  }

  await getAdminFirestore().collection(USERS_COLLECTION).doc(id).update(payload);
  return { ...existing, ...payload, updatedAt: now } as UserDoc;
}

export async function listUsers(role?: UserRole): Promise<UserDoc[]> {
  if (useLocalUserStore()) {
    const users = localDb.getRaw().users.map(toUserDoc);
    return role ? users.filter((user) => user.role === role) : users;
  }

  let ref: FirebaseFirestore.Query = getAdminFirestore().collection(USERS_COLLECTION);
  if (role) {
    ref = ref.where('role', '==', role);
  }
  const snap = await ref.get();
  return snap.docs.map(d => d.data() as UserDoc);
}
