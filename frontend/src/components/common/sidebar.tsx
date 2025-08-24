"use client";

import { Home, Ticket, Bell, Settings } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-full hidden md:flex flex-col">
      <div className="p-6 font-bold text-xl border-b">DevDesk</div>
      <nav className="flex flex-col gap-4 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
        >
          <Home size={18} /> Dashboard
        </Link>
        <Link
          href="/tickets"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
        >
          <Ticket size={18} /> Tickets
        </Link>
        <Link
          href="/notifications"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
        >
          <Bell size={18} /> Notifications
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
        >
          <Settings size={18} /> Settings
        </Link>
      </nav>
    </aside>
  );
}
