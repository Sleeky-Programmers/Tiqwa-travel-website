'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AdminPaginationProps {
	page: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	itemLabel?: string;
}

export function AdminPagination({
	page,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
	itemLabel = 'items',
}: AdminPaginationProps) {
	const pageNumbers = useMemo(() => {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, page - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);
		start = Math.max(1, end - maxVisible + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	}, [page, totalPages]);

	if (totalItems === 0) return null;

	const startItem = (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, totalItems);

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-sm text-muted-foreground">
				Showing {startItem}–{endItem} of {totalItems} {itemLabel}
			</p>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}>
					<ChevronLeft className="h-4 w-4" />
					Prev
				</Button>

				{pageNumbers.map((pageNum) => (
					<Button
						key={pageNum}
						variant={pageNum === page ? 'default' : 'outline'}
						size="sm"
						className={cn('min-w-8', pageNum === page && 'pointer-events-none')}
						onClick={() => onPageChange(pageNum)}>
						{pageNum}
					</Button>
				))}

				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
