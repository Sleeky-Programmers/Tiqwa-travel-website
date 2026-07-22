'use client';

import { Award, Calendar, Camera, CheckCircle, Edit2, Loader2, Mail, MapPin, Phone, Plane, Save, Shield, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { updateUserProfile } from '@/services/auth';

function getInitials(name: string): string {
	return name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export default function ProfilePage() {
	const { user, refreshUser } = useAuth();
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				phone: user.phone || '',
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
			setSuccess('Profile updated successfully');
			setIsEditing(false);
			setTimeout(() => setSuccess(null), 3000);
		} else {
			setError(result.error ?? 'Update failed');
		}

		setIsLoading(false);
	};

	const handleCancel = () => {
		if (user) {
			setFormData({
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				phone: user.phone || '',
			});
		}
		setIsEditing(false);
		setError(null);
	};

	const displayName = `${formData.firstName} ${formData.lastName}`.trim() || 'User';
	const initials = getInitials(displayName);
	// const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024";

	return (
		<div className="space-y-7 page-transition">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h1>
					<p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
						<User className="h-4 w-4" />
						Manage your personal information
					</p>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					<Shield className="h-3 w-3" />
					Verified Account
				</div>
			</div>

			{/* Profile Header Card */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:from-primary/20 dark:shadow-none">
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

				<div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
					{/* Avatar */}
					<div className="relative flex-shrink-0">
						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-3xl font-bold text-white shadow-lg ring-4 ring-primary/20">
							{initials}
						</div>
					</div>

					{/* User Info */}
					<div className="flex-1 text-center sm:text-left">
						<div className="flex items-center justify-center sm:justify-start gap-3">
							<h2 className="text-xl font-bold">{displayName}</h2>
							<div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
								<CheckCircle className="h-3 w-3" />
								Active
							</div>
						</div>
						<div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<Mail className="h-4 w-4" />
								{formData.email}
							</span>
							{/* <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Member since {memberSince}
              </span> */}
						</div>
					</div>

					{/* Stats */}
					<div className="flex gap-4 sm:ml-auto">
						<div className="text-center">
							<p className="text-xl font-bold">12</p>
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Flights</p>
						</div>
						<div className="w-px bg-border/40" />
						<div className="text-center">
							<p className="text-xl font-bold text-amber-500">2,450</p>
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider">Points</p>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Form */}
			<div className="rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
				<div className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
					<div>
						<h3 className="font-semibold">Personal Information</h3>
						<p className="text-xs text-muted-foreground">Update your profile details</p>
					</div>
					{!isEditing && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditing(true)}
							className="rounded-xl hover:bg-primary/10 hover:text-primary">
							<Edit2 className="h-4 w-4 mr-1.5" />
							Edit Profile
						</Button>
					)}
				</div>

				<div className="p-6">
					{/* Success Message */}
					{success && (
						<div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
							<CheckCircle className="h-5 w-5" />
							{success}
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-4 flex items-center gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<X className="h-5 w-5" />
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<Input
								label="First Name"
								value={formData.firstName}
								onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
								disabled={!isEditing}
								required
								className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							/>
							<Input
								label="Last Name"
								value={formData.lastName}
								onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
								disabled={!isEditing}
								required
								className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							/>
						</div>

						<Input
							label="Email Address"
							type="email"
							value={formData.email}
							disabled
							className="bg-muted/30 cursor-not-allowed"
							// icon={<Mail className="h-4 w-4 text-muted-foreground" />}
						/>

						<Input
							label="Phone Number"
							type="tel"
							value={formData.phone}
							onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
							disabled={!isEditing}
							placeholder="+234 801 234 5678"
							className={cn('transition-all', !isEditing && 'bg-muted/30 cursor-not-allowed')}
							// icon={<Phone className="h-4 w-4 text-muted-foreground" />}
						/>

						{/* Form Actions */}
						{isEditing && (
							<div className="flex items-center gap-3 pt-2 border-t border-border/40">
								<Button
									type="submit"
									disabled={isLoading}
									className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35">
									{isLoading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4 mr-2" />
											Save Changes
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
									<X className="h-4 w-4 mr-2" />
									Cancel
								</Button>
							</div>
						)}

						{!isEditing && (
							<div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
								<Shield className="h-4 w-4 text-primary" />
								Your email is verified and cannot be changed
							</div>
						)}
					</form>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Plane className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm font-medium">Total Bookings</p>
						<p className="text-lg font-bold">12</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
						<Award className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm font-medium">Rewards Points</p>
						<p className="text-lg font-bold text-amber-500">2,450</p>
					</div>
				</div>

				<div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-none">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
						<MapPin className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm font-medium">Destinations</p>
						<p className="text-lg font-bold">8</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// "use client";

// import { useState, useEffect } from "react";
// import { Loader2, CheckCircle } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";
// import { useAuth } from "@/contexts/AuthContext";
// import { updateUserProfile } from "@/services/auth";

// export default function ProfilePage() {
//   const { user, refreshUser } = useAuth();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       });
//     }
//   }, [user]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setSuccess(null);

//     const result = await updateUserProfile({
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       phone: formData.phone,
//     });

//     if (result.success) {
//       await refreshUser();
//       setSuccess("Profile updated successfully");
//       setTimeout(() => setSuccess(null), 3000);
//     } else {
//       setError(result.error ?? "Update failed");
//     }

//     setIsLoading(false);
//   };

//   return (
//     <div className="dashboard-page space-y-6">
//       <div className="dashboard-page-header">
//         <h1 className="dashboard-title">Profile Settings</h1>
//         <p className="dashboard-subtitle">Manage your personal information</p>
//       </div>

//       <Card hover={false} className="p-6">
//         {success && (
//           <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">
//             <CheckCircle className="h-4 w-4" />
//             {success}
//           </div>
//         )}
//         {error && (
//           <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <Input
//               label="First Name"
//               value={formData.firstName}
//               onChange={(e) =>
//                 setFormData({ ...formData, firstName: e.target.value })
//               }
//               required
//             />
//             <Input
//               label="Last Name"
//               value={formData.lastName}
//               onChange={(e) =>
//                 setFormData({ ...formData, lastName: e.target.value })
//               }
//               required
//             />
//           </div>
//           <Input
//             label="Email"
//             type="email"
//             value={formData.email}
//             disabled
//             className="bg-muted/50"
//           />
//           <Input
//             label="Phone Number"
//             type="tel"
//             value={formData.phone}
//             onChange={(e) =>
//               setFormData({ ...formData, phone: e.target.value })
//             }
//             placeholder="+234 801 234 5678"
//           />
//           <div className="flex justify-end">
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }
