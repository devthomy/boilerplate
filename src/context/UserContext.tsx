"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { User } from "@prisma/client";
import { api } from "@/trpc/react";

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const { user: clerkUser } = useUser();
  const createOrGetUserMutation = api.user.createOrGet.useMutation();
  console.log(clerkUser);
  useEffect(() => {
    const fetchEmail = async () => {
      setEmail(clerkUser?.emailAddresses[0].emailAddress || null);
    };

    if (isLoaded) {
      fetchEmail();
    }
  }, [isLoaded, email, clerkUser]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    if (hasAttemptedFetch || !email) {
      return;
    }

    async function fetchUser() {
      try {
        setLoading(true);
        setHasAttemptedFetch(true);
        const newUser = await createOrGetUserMutation.mutateAsync({
          userId: userId as string,
          email: email as string,
        });
        setUser(newUser);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [
    isLoaded,
    isSignedIn,
    userId,
    createOrGetUserMutation,
    hasAttemptedFetch,
    email,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500">Loading...</p>
      </div>
    );
  }
  console.log(user);
  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
