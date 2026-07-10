'use client';

import { Building, CreditCard, Gift, Loader2, Menu, Plus, Save, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { ApiKeyField } from '@/components/admin/ApiKeyField';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import {
	getFooterMenus,
	getGeneralSettings,
	getLoyaltySettings,
	getPaymentGateways,
	getPaymentMethods,
	getSiteMenus,
	updateFooterMenu,
	updateGeneralSettings,
	updateLoyaltySettings,
	updatePaymentGatewaySettings,
	updateSiteMenus,
} from '@/services/whitelabel-api';
import { PaymentGateway, PaymentMethod } from '@/types/whitelabel';

// For the settings page, use a different type
interface PaymentGatewaySettings {
	service: string;
	logo: string;
	public_key: string;
	secret_key: string;
	is_active: boolean;
}

interface GatewayWithKeys {
	service: string;
	logo: string;
	public_key: string;
	secret_key: string;
	is_active: boolean;
}

interface GeneralSettingsData {
	name: string;
	long_name: string;
	logo: string;
	physical_address: string;
	email_address: string;
	phone_number: string;
	support_email: string;
	support_phone: string;
	copyright: string;
	site_url: string;
	site_domain: string;
	blog_url: string;
	default_currency: string;
	facebook_link: string;
	twitter_link: string;
	instagram_link: string;
	linkedin_link: string;
}

interface LoyaltySettingsData {
	loyalty_mode: number;
	loyalty_threshold: number;
	loyalty_value: number;
	loyalty_policy: string;
}

interface SiteMenuData {
	id: number;
	active: number;
	title: string;
}

interface FooterMenuData {
	id: number;
	title: string;
	route: string;
	active: number;
}

type SettingsTab = 'general' | 'payments' | 'loyalty' | 'menus';

const tabs: Array<{ key: SettingsTab; label: string; icon: React.ElementType }> = [
	{ key: 'general', label: 'General', icon: Building },
	{ key: 'payments', label: 'Payments', icon: CreditCard },
	{ key: 'loyalty', label: 'Loyalty', icon: Gift },
	{ key: 'menus', label: 'Menus', icon: Menu },
];

// Empty State Component
function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="rounded-full bg-muted/30 p-4 mb-4">
				<Icon className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
		</div>
	);
}

export default function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState<SettingsTab>('general');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Settings state
	const [generalSettings, setGeneralSettings] = useState<GeneralSettingsData | null>(null);
	const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettingsData | null>(null);
	const [siteMenus, setSiteMenus] = useState<SiteMenuData[]>([]);
	const [footerMenus, setFooterMenus] = useState<FooterMenuData[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [paymentGateways, setPaymentGateways] = useState<GatewayWithKeys[]>([]);

	// Load all settings
	useEffect(() => {
		async function loadSettings() {
			setIsLoading(true);
			try {
				const [generalResult, loyaltyResult, siteMenusResult, footerMenusResult, gatewaysResult, methodsResult] = await Promise.all([
					getGeneralSettings(),
					getLoyaltySettings(),
					getSiteMenus(),
					getFooterMenus(),
					getPaymentGateways(),
					getPaymentMethods(),
				]);

				if (generalResult.success) setGeneralSettings(generalResult.data);
				if (loyaltyResult.success) setLoyaltySettings(loyaltyResult.data);
				if (siteMenusResult.success) setSiteMenus(siteMenusResult.data);
				if (footerMenusResult.success) setFooterMenus(footerMenusResult.data);
				if (gatewaysResult.success) {
					const mappedGateways = gatewaysResult.data.map((g: any) => ({
						service: g.service,
						logo: g.logo,
						public_key: g.public_key || '',
						secret_key: g.secret_key || '',
						is_active: g.is_active || false,
					}));
					setPaymentGateways(mappedGateways);
				}
				if (methodsResult.success) setPaymentMethods(methodsResult.data);
			} catch (error) {
				console.error('Failed to load settings:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadSettings();
	}, []);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			// Save based on active tab
			switch (activeTab) {
				case 'general':
					if (generalSettings) {
						// Build FormData for general settings
						const formData = new FormData();
						Object.entries(generalSettings).forEach(([key, value]) => {
							formData.append(key, String(value));
						});
						await updateGeneralSettings(formData);
					}
					break;
				case 'loyalty':
					if (loyaltySettings) {
						await updateLoyaltySettings(loyaltySettings);
					}
					break;
				case 'menus':
					// Save site menus
					await updateSiteMenus({ menus: siteMenus });
					// Save footer menus individually
					for (const menu of footerMenus) {
						await updateFooterMenu(menu.id, {
							title: menu.title,
							route: menu.route,
							active: menu.active,
						});
					}
					break;
				case 'payments':
					// Save payment gateways
					for (const gateway of paymentGateways) {
						await updatePaymentGatewaySettings({
							gateway: gateway.service,
							public_key: gateway.public_key,
							secret_key: gateway.secret_key,
							is_active: gateway.is_active,
						});
					}
					break;
			}
			// Show success toast
		} catch (error) {
			console.error('Failed to save settings:', error);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">Manage your application settings</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 border-b border-border/60">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${
								activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
							}`}>
							<Icon className="h-4 w-4" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* Content */}
			<div className="space-y-4">
				{/* General Settings */}
				{activeTab === 'general' &&
					(generalSettings ? (
						<>
							<CollapsibleSection
								title="Branding"
								defaultOpen
								icon={Building}>
								<div className="grid gap-4 sm:grid-cols-2">
									<Input
										label="Site Name"
										value={generalSettings.name}
										onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
									/>
									<Input
										label="Long Name"
										value={generalSettings.long_name}
										onChange={(e) => setGeneralSettings({ ...generalSettings, long_name: e.target.value })}
									/>
									<div className="sm:col-span-2">
										<label className="text-sm font-medium text-foreground">Logo</label>
										<div className="mt-2 flex items-center gap-4">
											{generalSettings.logo && (
												<img
													src={generalSettings.logo}
													alt="Logo"
													className="h-12 w-auto rounded-lg border border-border bg-white/50 p-1"
												/>
											)}
											<Button
												variant="outline"
												size="sm"
												disabled
												title="Coming soon">
												Upload New
											</Button>
										</div>
									</div>
								</div>
							</CollapsibleSection>

							<CollapsibleSection
								title="Contact Information"
								icon={Settings}>
								<div className="grid gap-4 sm:grid-cols-2">
									<Input
										label="Email Address"
										value={generalSettings.email_address}
										onChange={(e) => setGeneralSettings({ ...generalSettings, email_address: e.target.value })}
									/>
									<Input
										label="Phone Number"
										value={generalSettings.phone_number}
										onChange={(e) => setGeneralSettings({ ...generalSettings, phone_number: e.target.value })}
									/>
									<Input
										label="Support Email"
										value={generalSettings.support_email}
										onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
									/>
									<Input
										label="Support Phone"
										value={generalSettings.support_phone}
										onChange={(e) => setGeneralSettings({ ...generalSettings, support_phone: e.target.value })}
									/>
									<div className="sm:col-span-2">
										<Input
											label="Physical Address"
											value={generalSettings.physical_address}
											onChange={(e) => setGeneralSettings({ ...generalSettings, physical_address: e.target.value })}
										/>
									</div>
								</div>
							</CollapsibleSection>

							<CollapsibleSection
								title="Social Links"
								icon={Settings}>
								<div className="grid gap-4 sm:grid-cols-2">
									<Input
										label="Facebook"
										value={generalSettings.facebook_link}
										onChange={(e) => setGeneralSettings({ ...generalSettings, facebook_link: e.target.value })}
									/>
									<Input
										label="Twitter"
										value={generalSettings.twitter_link}
										onChange={(e) => setGeneralSettings({ ...generalSettings, twitter_link: e.target.value })}
									/>
									<Input
										label="Instagram"
										value={generalSettings.instagram_link}
										onChange={(e) => setGeneralSettings({ ...generalSettings, instagram_link: e.target.value })}
									/>
									<Input
										label="LinkedIn"
										value={generalSettings.linkedin_link}
										onChange={(e) => setGeneralSettings({ ...generalSettings, linkedin_link: e.target.value })}
									/>
								</div>
							</CollapsibleSection>

							<CollapsibleSection
								title="Site Details"
								icon={Settings}>
								<div className="grid gap-4 sm:grid-cols-2">
									<Input
										label="Site URL"
										value={generalSettings.site_url}
										onChange={(e) => setGeneralSettings({ ...generalSettings, site_url: e.target.value })}
									/>
									<Input
										label="Site Domain"
										value={generalSettings.site_domain}
										onChange={(e) => setGeneralSettings({ ...generalSettings, site_domain: e.target.value })}
									/>
									<Input
										label="Blog URL"
										value={generalSettings.blog_url}
										onChange={(e) => setGeneralSettings({ ...generalSettings, blog_url: e.target.value })}
									/>
									<div>
										<label className="text-sm font-medium text-foreground">Default Currency</label>
										<select
											value={generalSettings.default_currency}
											onChange={(e) => setGeneralSettings({ ...generalSettings, default_currency: e.target.value })}
											className="mt-1.5 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary">
											<option value="NGN">NGN - Nigerian Naira</option>
											<option value="USD">USD - US Dollar</option>
											<option value="EUR">EUR - Euro</option>
											<option value="GBP">GBP - British Pound</option>
										</select>
									</div>
									<div className="sm:col-span-2">
										<Input
											label="Copyright"
											value={generalSettings.copyright}
											onChange={(e) => setGeneralSettings({ ...generalSettings, copyright: e.target.value })}
										/>
									</div>
								</div>
							</CollapsibleSection>
						</>
					) : (
						<EmptyState
							title="No General Settings"
							description="General settings could not be loaded. Please try refreshing the page."
							icon={Building}
						/>
					))}

				{/* Payment Settings */}
				{activeTab === 'payments' && (
					<>
						<CollapsibleSection
							title="Payment Gateways"
							defaultOpen
							icon={CreditCard}>
							{paymentGateways.length === 0 ? (
								<EmptyState
									title="No Payment Gateways"
									description="No payment gateways have been configured yet. Add one to start accepting payments."
									icon={CreditCard}
								/>
							) : (
								<div className="space-y-6">
									{paymentGateways.map((gateway) => (
										<div
											key={gateway.service}
											className="rounded-xl border border-border p-4 space-y-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													{gateway.logo && (
														<img
															src={gateway.logo}
															alt={gateway.service}
															className="h-8 w-auto object-contain"
														/>
													)}
													<span className="font-medium capitalize">{gateway.service}</span>
												</div>
												<Toggle
													label="Active"
													checked={gateway.is_active}
													onChange={(checked) => {
														setPaymentGateways(paymentGateways.map((g) => (g.service === gateway.service ? { ...g, is_active: checked } : g)));
													}}
												/>
											</div>
											<div className="grid gap-4 sm:grid-cols-2">
												<ApiKeyField
													label="Public Key"
													value={gateway.public_key || ''}
													onChange={(value) => {
														setPaymentGateways(paymentGateways.map((g) => (g.service === gateway.service ? { ...g, public_key: value } : g)));
													}}
												/>
												<ApiKeyField
													label="Secret Key"
													value={gateway.secret_key || ''}
													onChange={(value) => {
														setPaymentGateways(paymentGateways.map((g) => (g.service === gateway.service ? { ...g, secret_key: value } : g)));
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</CollapsibleSection>

						<CollapsibleSection
							title="Payment Methods"
							icon={CreditCard}>
							{paymentMethods.length === 0 ? (
								<EmptyState
									title="No Payment Methods"
									description="No payment methods have been configured. Add one to enable payments."
									icon={CreditCard}
								/>
							) : (
								<div className="space-y-3">
									{paymentMethods.map((method) => (
										<div
											key={method.id}
											className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
											<div>
												<p className="font-medium">{method.title}</p>
												<p className="text-xs text-muted-foreground">
													ID: {method.identifier} • Priority: {method.priority}
												</p>
											</div>
											<div className="flex items-center gap-4">
												{method.identifier === 'FLEXI_PAY' && (
													<div className="w-20">
														<Input
															label="Interest %"
															type="number"
															value={method.interest_rate}
															onChange={(e) => {
																setPaymentMethods(paymentMethods.map((m) => (m.id === method.id ? { ...m, interest_rate: Number(e.target.value) } : m)));
															}}
															className="h-8 text-xs"
														/>
													</div>
												)}
												<Toggle
													label="Active"
													checked={method.status === 1}
													onChange={(checked) => {
														setPaymentMethods(paymentMethods.map((m) => (m.id === method.id ? { ...m, status: checked ? 1 : 0 } : m)));
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</CollapsibleSection>
					</>
				)}

				{/* Loyalty Settings */}
				{activeTab === 'loyalty' &&
					(loyaltySettings ? (
						<CollapsibleSection
							title="Loyalty Configuration"
							defaultOpen
							icon={Gift}>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="text-sm font-medium text-foreground">Loyalty Mode</label>
									<div className="mt-1.5">
										<Toggle
											label="Enabled"
											checked={loyaltySettings.loyalty_mode === 1}
											onChange={(checked) =>
												setLoyaltySettings({
													...loyaltySettings,
													loyalty_mode: checked ? 1 : 0,
												})
											}
										/>
									</div>
								</div>
								<Input
									label="Loyalty Threshold"
									type="number"
									value={loyaltySettings.loyalty_threshold}
									onChange={(e) =>
										setLoyaltySettings({
											...loyaltySettings,
											loyalty_threshold: Number(e.target.value),
										})
									}
								/>
								<Input
									label="Loyalty Value"
									type="number"
									value={loyaltySettings.loyalty_value}
									onChange={(e) =>
										setLoyaltySettings({
											...loyaltySettings,
											loyalty_value: Number(e.target.value),
										})
									}
									helperText="Points earned per booking"
								/>
								<div>
									<label className="text-sm font-medium text-foreground">Loyalty Policy</label>
									<select
										value={loyaltySettings.loyalty_policy}
										onChange={(e) =>
											setLoyaltySettings({
												...loyaltySettings,
												loyalty_policy: e.target.value,
											})
										}
										className="mt-1.5 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary">
										<option value="no-restriction">No Restriction</option>
										<option value="restricted">Restricted</option>
									</select>
								</div>
							</div>
						</CollapsibleSection>
					) : (
						<EmptyState
							title="No Loyalty Settings"
							description="Loyalty settings could not be loaded. Please try refreshing the page."
							icon={Gift}
						/>
					))}

				{/* Menus Settings */}
				{activeTab === 'menus' && (
					<>
						<CollapsibleSection
							title="Site Menus"
							defaultOpen
							icon={Menu}>
							{siteMenus.length === 0 ? (
								<EmptyState
									title="No Site Menus"
									description="No site menus have been configured. Add one to create navigation."
									icon={Menu}
								/>
							) : (
								<div className="space-y-3">
									{siteMenus.map((menu) => (
										<div
											key={menu.id}
											className="flex items-center justify-between rounded-xl border border-border p-4">
											<span className="font-medium">{menu.title}</span>
											<Toggle
												label="Active"
												checked={menu.active === 1}
												onChange={(checked) => {
													setSiteMenus(siteMenus.map((m) => (m.id === menu.id ? { ...m, active: checked ? 1 : 0 } : m)));
												}}
											/>
										</div>
									))}
								</div>
							)}
						</CollapsibleSection>

						<CollapsibleSection
							title="Footer Menus"
							icon={Menu}>
							{footerMenus.length === 0 ? (
								<EmptyState
									title="No Footer Menus"
									description="No footer menus have been configured. Add one to populate the footer."
									icon={Menu}
								/>
							) : (
								<div className="space-y-3">
									{footerMenus.map((menu) => (
										<div
											key={menu.id}
											className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
											<div>
												<p className="font-medium">{menu.title}</p>
												<p className="text-xs text-muted-foreground">{menu.route}</p>
											</div>
											<Toggle
												label="Active"
												checked={menu.active === 1}
												onChange={(checked) => {
													setFooterMenus(footerMenus.map((m) => (m.id === menu.id ? { ...m, active: checked ? 1 : 0 } : m)));
												}}
											/>
										</div>
									))}
								</div>
							)}
						</CollapsibleSection>
					</>
				)}
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-4 border-t border-border">
				<Button
					onClick={handleSave}
					disabled={isSaving}>
					<Save className="h-4 w-4 mr-2" />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</motion.div>
	);
}
