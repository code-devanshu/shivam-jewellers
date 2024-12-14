"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-slate-50">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <span className="first-letter:uppercase text-xl font-semibold">
          {pathname.split("/").slice(-1)}
        </span>
      </div>
      <div className="ml-auto px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full border border-slate-300 bg-slate-50"
            >
              <Avatar className="h-8 w-8 flex justify-center items-center">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={`@${user?.email}`}
                />
                <AvatarFallback>DV</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-slate-100 border border-slate-300 rounded-lg"
            align="end"
          >
            <DropdownMenuLabel className="font-normal border-b border-slate-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name ? user.name : "Vaibhav Verma"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
