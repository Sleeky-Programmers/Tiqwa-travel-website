export function parseDuration(duration: string | number): number {
	if (typeof duration === 'number') return duration;
	const hours = duration.match(/(\d+)h/)?.[1];
	const minutes = duration.match(/(\d+)m/)?.[1];
	return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}
