"use client";

import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";

export interface PassengerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface PassengerFormProps {
  data: PassengerData;
  onChange: (data: PassengerData) => void;
  onPhoneChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PassengerForm({ data, onChange, onPhoneChange }: PassengerFormProps) {
  const update = (field: keyof PassengerData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Passenger Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          value={data.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          placeholder="John"
          required
        />
        <Input
          label="Last Name"
          value={data.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          placeholder="Doe"
          required
        />
      </div>
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => update("email", e.target.value)}
        placeholder="john@example.com"
        required
      />
      <Input
        label="Phone"
        type="tel"
        value={data.phone}
        onChange={onPhoneChange || ((e) => update("phone", e.target.value))}
        placeholder="+234 801 234 5678"
        required
      />
      <DatePicker
        label="Date of Birth"
        value={data.dateOfBirth}
        onChange={(date) => update("dateOfBirth", date)}
        placeholder="Select date of birth"
        required
        disablePast={true}
      />
    </div>
  );
}