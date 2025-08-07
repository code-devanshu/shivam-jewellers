"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  productId: string;
  productName: string;
}

export default function DeleteButtonWithConfirm({
  productId,
  productName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Close modal on ESC key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Focus trap: autofocus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirmDelete = () => {
    const form = document.getElementById(
      `delete-form-${productId}`
    ) as HTMLFormElement;
    form.requestSubmit();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="inline-block px-4 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white shadow-sm transition font-semibold"
      >
        Delete
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50
          animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          ref={modalRef}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border border-white/30
            animate-scaleIn"
          >
            <h3 className="text-lg font-semibold mb-4" id="modal-title">
              Confirm Deletion
            </h3>
            <p className="mb-6">
              Are you sure you want to delete <strong>{productName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
