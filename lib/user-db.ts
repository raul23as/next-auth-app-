import fs from "fs";
import path from "path";
import { hashPassword } from "./auth-utils";

const usersFile = path.join(process.cwd(), "data", "users.json");

interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  provider?: string;
}

export async function initializeUsersFile() {
  const dir = path.dirname(usersFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await initializeUsersFile();
  const data = fs.readFileSync(usersFile, "utf-8");
  const users: User[] = JSON.parse(data);
  return users.find((u) => u.email === email) || null;
}

export async function createUser(
  email: string,
  name: string,
  password?: string
): Promise<User> {
  await initializeUsersFile();
  const data = fs.readFileSync(usersFile, "utf-8");
  const users: User[] = JSON.parse(data);

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user: User = {
    id: Date.now().toString(),
    email,
    name,
  };

  if (password) {
    user.password = await hashPassword(password);
  }

  users.push(user);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return user;
}

export async function updateUser(
  email: string,
  updates: Partial<User>
): Promise<User | null> {
  await initializeUsersFile();
  const data = fs.readFileSync(usersFile, "utf-8");
  const users: User[] = JSON.parse(data);

  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) return null;

  users[userIndex] = { ...users[userIndex], ...updates };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return users[userIndex];
}
