'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
	key: keyof T | string;
	header: string;
	render?: (item: T) => React.ReactNode;
	className?: string;
}

interface AdminTableProps<T> {
	data: T[];
	columns: Column<T>[];
	onRowClick?: (item: T) => void;
	isLoading?: boolean;
	emptyMessage?: string;
	getRowKey: (item: T) => string | number;
	skeletonRows?: number;
}

export function AdminTable<T>({ data, columns, onRowClick, isLoading = false, emptyMessage = 'No results found', getRowKey, skeletonRows = 5 }: AdminTableProps<T>) {
	if (isLoading) {
		return (
			<div className="glossy-card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border bg-primary/5">
								{columns.map((column) => (
									<th
										key={String(column.key)}
										className="px-4 py-3 font-medium text-muted-foreground">
										{column.header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: skeletonRows }).map((_, rowIndex) => {
								const rowKey = `skeleton-${rowIndex}`;
								return (
									<tr
										key={rowKey}
										className="border-b border-border/60 last:border-0">
										{columns.map((column, colIndex) => {
											const cellKey = `skeleton-${rowIndex}-${colIndex}`;
											return (
												<td
													key={cellKey}
													className="px-4 py-3">
													<Skeleton className="h-4 w-full max-w-[120px]" />
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="glossy-card p-12 text-center">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="glossy-card overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[640px] text-left text-sm">
					<thead>
						<tr className="border-b border-border bg-primary/5">
							{columns.map((column) => (
								<th
									key={String(column.key)}
									className={cn('px-4 py-3 font-medium text-muted-foreground', column.className)}>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((item) => (
							<tr
								key={getRowKey(item)}
								onClick={onRowClick ? () => onRowClick(item) : undefined}
								className={cn('border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5', onRowClick && 'cursor-pointer')}>
								{columns.map((column, colIndex) => {
									const cellKey = `${getRowKey(item)}-${colIndex}`;
									return (
										<td
											key={cellKey}
											className={cn('px-4 py-3', column.className)}>
											{column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key as string] ?? '—')}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
