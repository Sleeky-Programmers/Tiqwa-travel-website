'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

import { CountryDropdown } from '@/components/ui/CountryDropdown';
import { DateOfBirthPicker } from '@/components/ui/DateOfBirthPicker';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { PassengerType } from '@/types/whitelabel';

export interface PassengerData {
	// Personal info
	title: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr' | 'prof' | '';
	firstName: string;
	middleName: string;
	lastName: string;
	gender: 'male' | 'female' | 'other' | '';
	dateOfBirth: string;
	email: string;
	phone: string;

	// Document info
	documentIssueDate: string;
	documentNumber: string;
	documentExpiryDate: string;
	issuingCountry: string;
	nationalityCountry: string;
	documentType: 'passport' | 'id_card' | '';
}

interface PassengerFormProps {
	data: PassengerData;
	onChange: (data: PassengerData) => void;
	onPhoneChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	showRemove?: boolean;
	onRemove?: () => void;
	passengerNumber?: number;
	totalPassengers?: number;
	passengerType?: PassengerType;
	isDomestic?: boolean;
	/** Only show/require document fields when the flight's confirm-price response says so. */
	documentRequired?: boolean;
	/** Locks every field once the user has moved into the payment step. */
	disabled?: boolean;
}

const EXPIRY_MIN_YEAR = new Date().getFullYear();
const EXPIRY_MAX_YEAR = EXPIRY_MIN_YEAR + 15;

const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
	adult: 'Adult',
	child: 'Child',
	infant: 'Infant',
};

const TITLE_OPTIONS = [
	{ value: 'mr', label: 'Mr' },
	{ value: 'ms', label: 'Ms' },
	{ value: 'mrs', label: 'Mrs' },
	{ value: 'miss', label: 'Miss' },
];

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'other', label: 'Other' },
];

const INTERNATIONAL_DOCUMENT_TYPES = [
	{ value: 'passport', label: 'Passport' },
	{ value: 'id_card', label: 'National ID Card' },
];

const DOMESTIC_DOCUMENT_TYPES = [{ value: 'id_card', label: 'National ID Card' }];

export function PassengerForm({
	data,
	onChange,
	onPhoneChange,
	showRemove = false,
	onRemove,
	passengerNumber,
	totalPassengers,
	passengerType,
	isDomestic = false,
	documentRequired = false,
	disabled = false,
}: PassengerFormProps) {
	const [isTitleOpen, setIsTitleOpen] = useState(false);
	const [isDocumentTypeOpen, setIsDocumentTypeOpen] = useState(false);

	const update = (field: keyof PassengerData, value: string) => {
		onChange({ ...data, [field]: value });
	};

	const documentOptions = isDomestic ? DOMESTIC_DOCUMENT_TYPES : INTERNATIONAL_DOCUMENT_TYPES;

	return (
		<div className="space-y-4">
			{/* Header with passenger number and remove button */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="text-lg font-semibold">Passenger Details {passengerNumber && totalPassengers && `(${passengerNumber} of ${totalPassengers})`}</h3>
					{passengerType && (
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{PASSENGER_TYPE_LABELS[passengerType]}</span>
					)}
				</div>
				{showRemove && onRemove && (
					<button
						type="button"
						onClick={onRemove}
						disabled={disabled}
						className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive transition-all hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40">
						<X className="h-3.5 w-3.5" />
						Remove
					</button>
				)}
			</div>

			{/* Title + First Name + Middle Name + Last Name */}
			<div className="grid gap-4 sm:grid-cols-4">
				{/* Title */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-medium text-foreground">
						Title <span className="ml-1 text-primary">*</span>
					</label>
					<div className="relative">
						<button
							type="button"
							onClick={() => setIsTitleOpen(!isTitleOpen)}
							disabled={disabled}
							className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-xs font-normal transition-all hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50">
							<span className={cn(!data.title && 'text-muted-foreground')}>{data.title ? TITLE_OPTIONS.find((opt) => opt.value === data.title)?.label : 'Select'}</span>
							<ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isTitleOpen && 'rotate-180')} />
						</button>
						{isTitleOpen && (
							<div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
								{TITLE_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											update('title', opt.value);
											setIsTitleOpen(false);
										}}
										className={cn('w-full px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10', data.title === opt.value && 'bg-primary/10 text-primary')}>
										{opt.label}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* First Name */}
				<div className="flex flex-col gap-1.5">
					<Input
						required
						disabled={disabled}
						placeholder="John"
						label="First Name"
						value={data.firstName}
						onChange={(e) => update('firstName', e.target.value)}
					/>
				</div>

				{/* Middle Name */}
				<div className="flex flex-col gap-1.5">
					<Input
						disabled={disabled}
						label="Middle Name"
						value={data.middleName}
						placeholder="(Optional)"
						onChange={(e) => update('middleName', e.target.value)}
					/>
				</div>

				{/* Last Name */}
				<div className="flex flex-col gap-1.5">
					<Input
						required
						disabled={disabled}
						label="Last Name"
						placeholder="Doe"
						value={data.lastName}
						onChange={(e) => update('lastName', e.target.value)}
					/>
				</div>
			</div>

			{/* Gender */}
			<div>
				<label className="text-xs font-medium text-foreground">
					Gender <span className="ml-1 text-primary">*</span>
				</label>
				<div className="mt-1 flex gap-2">
					{GENDER_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => update('gender', opt.value)}
							disabled={disabled}
							className={`
                h-9 flex-1 rounded-xl border px-3 text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50
                ${data.gender === opt.value ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:bg-primary/10'}
              `}>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{/* Contact Info */}
			<div className="grid gap-4 sm:grid-cols-2">
				<Input
					required
					disabled={disabled}
					type="email"
					label="Email"
					value={data.email}
					placeholder="john@example.com"
					onChange={(e) => update('email', e.target.value)}
				/>
				<Input
					required
					disabled={disabled}
					type="tel"
					label="Phone"
					value={data.phone}
					placeholder="+234 801 234 5678"
					onChange={onPhoneChange || ((e) => update('phone', e.target.value))}
				/>
			</div>

			{/* Date of Birth */}
			<DateOfBirthPicker
				required
				label="Date of Birth"
				value={data.dateOfBirth}
				disabled={{ after: new Date() }}
				fieldDisabled={disabled}
				placeholder="Select date of birth"
				onChange={(date) => update('dateOfBirth', date)}
			/>

			{/* Document Section — only shown when the flight's confirm-price response requires it */}
			{documentRequired && (
				<div className="border-t border-border pt-4">
					<h4 className="text-sm font-semibold">Document Details</h4>
					<p className="text-xs text-muted-foreground">
						{isDomestic ? 'National ID Card required for domestic flights' : 'Passport or National ID Card required for international flights'}
					</p>

					<div className="mt-3 grid gap-4 sm:grid-cols-2">
						{/* Document Type */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-foreground">
								Document Type <span className="ml-1 text-primary">*</span>
							</label>
							<div className="relative">
								<button
									type="button"
									onClick={() => setIsDocumentTypeOpen(!isDocumentTypeOpen)}
									disabled={disabled}
									className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-xs font-normal transition-all hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50">
									<span className={cn(!data.documentType && 'text-muted-foreground')}>
										{data.documentType ? documentOptions.find((opt) => opt.value === data.documentType)?.label : `Select document type${isDomestic ? '' : ''}`}
									</span>
									<ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isDocumentTypeOpen && 'rotate-180')} />
								</button>
								{isDocumentTypeOpen && (
									<div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
										{documentOptions.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => {
													update('documentType', opt.value);
													setIsDocumentTypeOpen(false);
												}}
												className={cn(
													'w-full px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10',
													data.documentType === opt.value && 'bg-primary/10 text-primary'
												)}>
												{opt.label}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Document Number */}
						<Input
							required
							disabled={disabled}
							label="Document Number"
							placeholder="A000345633"
							value={data.documentNumber}
							onChange={(e) => update('documentNumber', e.target.value)}
						/>

						{/* Document Issue Date — must be in the past */}
						<DateOfBirthPicker
							required
							label="Document Issue Date"
							value={data.documentIssueDate}
							placeholder="Select issue date"
							disabled={{ after: new Date() }}
							fieldDisabled={disabled}
							onChange={(date) => update('documentIssueDate', date)}
						/>

						{/* Document Expiry Date — must be today or later, and the picker needs to reach
						    at least 10 years out (passports are commonly valid that long). */}
						<DateOfBirthPicker
							required
							label="Document Expiry Date"
							value={data.documentExpiryDate}
							placeholder="Select expiry date"
							disabled={{ before: new Date() }}
							minYear={EXPIRY_MIN_YEAR}
							maxYear={EXPIRY_MAX_YEAR}
							fieldDisabled={disabled}
							onChange={(date) => update('documentExpiryDate', date)}
						/>

						{/* Issuing Country */}
						<CountryDropdown
							required
							disabled={disabled}
							placeholder="Select country"
							label="Issuing Country"
							value={data.issuingCountry}
							onChange={(iso2) => update('issuingCountry', iso2)}
						/>

						{/* Nationality Country */}
						<CountryDropdown
							required
							disabled={disabled}
							placeholder="Select country"
							label="Nationality Country"
							value={data.nationalityCountry}
							onChange={(iso2) => update('nationalityCountry', iso2)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
