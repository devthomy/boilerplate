"use client";
import { SignOutButton } from "@clerk/nextjs";
import { useUserContext } from "@/context/UserContext";
export default function DashboardPage() {
    const { user } = useUserContext();
    return (
        <div>
            <h1>Dashboard</h1>
            <p>{user?.userId}</p>
            <SignOutButton />
        </div>
    );
}