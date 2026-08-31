"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { apiFetch } from "@/lib/auth-client";
import { useProfile } from "@/hooks/useProfile";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  givenName: string;
  lastName: string;
}

export default function EditNameModal({ isOpen, onClose, givenName, lastName }: EditNameModalProps) {
  const { refetch } = useProfile();
  const [firstName, setFirstName] = useState(givenName);
  const [surname, setSurname] = useState(lastName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form to the current profile values each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(givenName);
      setSurname(lastName);
      setError(null);
    }
  }, [isOpen, givenName, lastName]);

  const handleSave = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = surname.trim();
    if (!trimmedFirst || !trimmedLast) {
      setError("First and last name are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ given_name: trimmedFirst, family_name: trimmedLast }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to update name");
      }
      await refetch();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Name
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your first and last name.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input
                  id="edit-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input
                  id="edit-last-name"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-error-500">{error}</p>
            )}
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
