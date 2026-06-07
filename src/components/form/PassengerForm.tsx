"use client";

import { Input } from "@/components/ui/Input";

export interface PassengerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PassengerFormProps {
  data: PassengerData;
  onChange: (data: PassengerData) => void;
}

export function PassengerForm({ data, onChange }: PassengerFormProps) {
  const update = (field: keyof PassengerData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Passenger Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First Name" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" required />
        <Input label="Last Name" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" required />
      </div>
      <Input label="Email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" required />
      <Input label="Phone" type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" required />
    </div>
  );
}
