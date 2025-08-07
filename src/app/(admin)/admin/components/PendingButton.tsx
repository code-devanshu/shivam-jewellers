"use client";

import { useFormStatus } from "react-dom";

export default function PendingButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded font-semibold shadow disabled:opacity-60"
      disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}
