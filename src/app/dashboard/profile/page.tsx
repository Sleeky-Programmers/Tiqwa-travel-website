"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/auth";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    });

    if (result.success) {
      await refreshUser();
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error ?? "Update failed");
    }

    setIsLoading(false);
  };

  return (
    <div className="dashboard-page space-y-6">
      <div className="dashboard-page-header">
        <h1 className="dashboard-title">Profile Settings</h1>
        <p className="dashboard-subtitle">Manage your personal information</p>
      </div>

      <Card hover={false} className="p-6">
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted/50"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+234 801 234 5678"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
