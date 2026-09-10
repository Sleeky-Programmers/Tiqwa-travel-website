'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	onSearch?: () => void;
	searchPlaceholder?: string;
	statusValue?: string;
	onStatusChange?: (value: string) => void;
	statusOptions?: Array<{ value: string; label: string }>;
	dateRange?: { from: string; to: string };
	onDateRangeChange?: (range: { from: string; to: string }) => void;
	onClear?: () => void;
	showDateRange?: boolean;
}

export function AdminFilters({
	searchValue,
	onSearchChange,
	onSearch,
	searchPlaceholder = 'Search...',
	statusValue,
	onStatusChange,
	statusOptions,
	dateRange,
	onDateRangeChange,
	onClear,
	showDateRange = false,
}: AdminFiltersProps) {
	const [localSearch, setLocalSearch] = useState(searchValue);
	const hasActiveFilters =
		searchValue.length > 0 || (statusValue && statusValue !== 'ALL') || (dateRange?.from && dateRange.from.length > 0) || (dateRange?.to && dateRange.to.length > 0);

	const handleSearch = () => {
		onSearchChange(localSearch);
		if (onSearch) onSearch();
	};

	return (
		<div className="glossy-card space-y-4 p-4">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end">
				{/* Search Input with Button */}
				<div className="relative flex flex-1 min-w-[200px]">
					<Input
						placeholder={searchPlaceholder}
						value={localSearch}
						onChange={(e) => setLocalSearch(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						className="pl-9 pr-20 h-9 rounded-r-none"
					/>
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Button
						onClick={handleSearch}
						size="sm"
						className="rounded-l-none h-9 px-4 border-l-0">
						<Search className="h-4 w-4" />
					</Button>
				</div>

				{/* Status Dropdown */}
				{statusOptions && onStatusChange && (
					<div className="flex flex-col gap-1.5 min-w-[160px]">
						<label className="text-xs font-medium text-foreground">Status</label>
						<Select
							value={statusValue}
							onValueChange={onStatusChange}>
							<SelectTrigger className="w-full bg-background">
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Date Range Picker */}
				{showDateRange && onDateRangeChange && (
					<div className="flex flex-col gap-1.5 min-w-[220px]">
						<label className="text-xs font-medium text-foreground">Date Range</label>
						<DateRangePicker
							value={dateRange}
							onChange={onDateRangeChange}
							placeholder="Select date range"
						/>
					</div>
				)}

				{/* Clear Filters */}
				{onClear && hasActiveFilters && (
					<Button
						variant="outline"
						onClick={onClear}
						className="shrink-0">
						<X className="h-4 w-4" />
						Clear Filters
					</Button>
				)}
			</div>
		</div>
	);
}
