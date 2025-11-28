"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistance } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import {
  AlertTriangle,
  AtSign,
  Copy,
  Fingerprint,
  GraduationCap,
  Laptop,
  Save,
  Shield,
  Smartphone,
  Trash2,
  UserCog
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { updateUser } from "~/actions/dashboard.admin";
import { deleteUserResourcesById } from "~/actions/user.core";
import { authClient } from "~/auth/client";
import { emailSchema, genderSchema, ROLES } from "~/constants";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass";
import type { users } from "~/db/schema";
import type { HostelType } from "~/models/hostel_n_outpass";

// Types
type UserType = InferSelectModel<typeof users>;

// Updated Schema matching your table
const formSchema = z.object({
  // Identity
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayUsername: z.string().optional(),
  
  // Academic
  gender: genderSchema,
  department: z.string({ required_error: "Department is required" }),
  hostelId: z.string().default("not_specified"),
  
  // Access
  role: z.string(), // Primary Role
  other_roles: z.array(z.string()), // Secondary Roles
  other_emails: z.array(emailSchema).optional(),
});

// ----------------------------------------------------------------------
// 1. PAGE HEADER
// ----------------------------------------------------------------------
export function UserHeader({ user }: { user: UserType }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b pb-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono text-foreground/80">
                        <AtSign className="h-3.5 w-3.5 opacity-70" /> {user.username}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{user.email}</span>
                    <Badge variant={user.emailVerified ? "outline" : "destructive"} className="h-5 text-[10px] ml-2">
                        {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                </div>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// 2. SIDEBAR
// ----------------------------------------------------------------------
export function UserSidebar({ user }: { user: UserType }) {
    const handleImpersonate = async () => {
        const toastId = toast.loading("Switching identity...");
        try {
            await authClient.admin.impersonateUser({ userId: user.id });
            toast.success(`Now impersonating ${user.name}`, { id: toastId });
            window.location.href = "/dashboard"; 
        } catch (error) {
            toast.error("Impersonation failed", { id: toastId });
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? This deletes ALL user data permanently.")) return;
        const toastId = toast.loading("Deleting user...");
        try {
            await deleteUserResourcesById(user.id);
            await authClient.admin.removeUser({ userId: user.id });
            toast.success("User deleted successfully", { id: toastId });
            window.location.href = "/admin/users";
        } catch (error) {
            toast.error("Failed to delete user", { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/40 p-3 rounded-md border flex items-center justify-between gap-2">
                        <div className="space-y-0.5 overflow-hidden">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">User ID</p>
                            <p className="font-mono text-xs truncate" title={user.id}>{user.id}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => {
                            navigator.clipboard.writeText(user.id);
                            toast.success("Copied ID");
                        }}>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-muted-foreground">Created</span>
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed">
                            <span className="text-muted-foreground">Updated</span>
                            <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive/20 shadow-none bg-destructive/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-background hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={handleImpersonate}>
                        <UserCog className="h-4 w-4 mr-2" /> Impersonate
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

// ----------------------------------------------------------------------
// 3. MAIN CONTENT TABS
// ----------------------------------------------------------------------
export function UserContent({ user, hostels }: { user: UserType, hostels: HostelType[] }) {
    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 mb-8 bg-transparent border-b gap-8 rounded-none">
                <TabsTrigger 
                    value="profile" 
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                    Profile & Settings
                </TabsTrigger>
                <TabsTrigger 
                    value="security" 
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                    Security & Sessions
                </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-6">
                <UpdateForm user={user} hostels={hostels} />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
                <SessionManager user={user} />
            </TabsContent>
        </Tabs>
    )
}

// ----------------------------------------------------------------------
// 4. UPDATE FORM
// ----------------------------------------------------------------------
function UpdateForm({ user, hostels }: { user: UserType, hostels: HostelType[] }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user.username,
            displayUsername: user.displayUsername || "not_specified",
            department: user.department,
            role: user.role, // Primary Role
            other_roles: user.other_roles || [],
            gender: user.gender,
            hostelId: user.hostelId || "not_specified",
            other_emails: user.other_emails || [],
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        toast.promise(updateUser(user.id, data), {
            loading: "Saving changes...",
            success: "Profile updated successfully",
            error: "Failed to update profile",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Section: Identification */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Fingerprint className="h-5 w-5 text-primary" /> Identity & Account
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 bottom-2 text-muted-foreground">@</span>
                                            <Input className="pl-8" placeholder="username" {...field} disabled />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="displayUsername"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Public display name" {...field} />
                                    </FormControl>
                                    <FormDescription>Shown on public profiles.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Academic */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> Academic Profile
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {DEPARTMENTS_LIST.map(d => (
                                                <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="hostelId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hostel Residence</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={hostels.length === 0}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign hostel" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="not_specified">Non-Resident</SelectItem>
                                            {hostels.map(h => (
                                                <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel className="block mb-2">Gender Identity</FormLabel>
                                    <FormControl>
                                        <ToggleGroup type="single" value={field.value} onValueChange={field.onChange} className="justify-start">
                                            {["male", "female", "not_specified"].map(g => (
                                                <ToggleGroupItem key={g} value={g} className="capitalize px-4 border">
                                                    {g.replace("_", " ")}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section: Access Control */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> System Access
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
                        
                        {/* Primary Role Selector */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select primary role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Assuming these are your core roles */}
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Main permission level.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Secondary Roles Multi-Select */}
                        <FormField
                            control={form.control}
                            name="other_roles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Roles</FormLabel>
                                    <FormControl>
                                        <MultiSelector values={field.value} onValuesChange={field.onChange} loop>
                                            <MultiSelectorTrigger>
                                                <MultiSelectorInput placeholder="Select secondary roles..." />
                                            </MultiSelectorTrigger>
                                            <MultiSelectorContent>
                                                <MultiSelectorList>
                                                    {ROLES.map(role => (
                                                        <MultiSelectorItem key={role} value={role}>
                                                            {role.replace(/_/g, " ")}
                                                        </MultiSelectorItem>
                                                    ))}
                                                </MultiSelectorList>
                                            </MultiSelectorContent>
                                        </MultiSelector>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Linked Emails */}
                        <FormField
                            control={form.control}
                            name="other_emails"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Linked Official Emails</FormLabel>
                                    <FormControl>
                                        <MultiSelector values={(field.value || []) as string[]} onValuesChange={field.onChange} loop>
                                            <MultiSelectorTrigger>
                                                <MultiSelectorInput placeholder="Link in-charge emails..." />
                                            </MultiSelectorTrigger>
                                            <MultiSelectorContent>
                                                <MultiSelectorList>
                                                    {Array.from(new Set(IN_CHARGES_EMAILS)).map(ic => (
                                                        <MultiSelectorItem key={ic.slug} value={ic.email}>{ic.email}</MultiSelectorItem>
                                                    ))}
                                                </MultiSelectorList>
                                            </MultiSelectorContent>
                                        </MultiSelector>
                                    </FormControl>
                                    <FormDescription>Official emails linked to this account for notifications.</FormDescription>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="sticky bottom-4 flex justify-end bg-background/80 backdrop-blur-sm p-4 border-t z-10">
                     <Button type="submit" size="lg" className="min-w-[150px] shadow-lg">
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                     </Button>
                </div>
            </form>
        </Form>
    )
}

// ----------------------------------------------------------------------
// 5. SESSION MANAGER
// ----------------------------------------------------------------------
function SessionManager({ user }: { user: UserType }) {
    const [sessions, setSessions] = useState<any[]>([]);
    
    useEffect(() => {
        authClient.admin.listUserSessions({ userId: user.id })
            .then(res => setSessions(res.data?.sessions || []))
            .catch(console.error);
    }, [user.id]);

    const handleRevoke = (token: string) => {
        authClient.admin.revokeUserSession({ sessionToken: token })
            .then(() => {
                setSessions(prev => prev.filter(p => p.token !== token));
                toast.success("Session revoked");
            });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Active Devices</CardTitle>
                    <CardDescription>Manage sessions logged into {user.email}.</CardDescription>
                </div>
                {sessions.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => {
                        authClient.admin.revokeUserSessions({ userId: user.id })
                           .then(() => {
                               setSessions([]);
                               toast.success("All sessions revoked");
                           });
                    }}>
                        Revoke All
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/50">
                        <Shield className="h-10 w-10 mb-2 opacity-20" />
                        <p>No active sessions found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        {session.userAgent?.toLowerCase().includes("mobile") ? 
                                            <Smartphone className="h-6 w-6" /> : 
                                            <Laptop className="h-6 w-6" />
                                        }
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-md" title={session.userAgent}>
                                            {session.userAgent || "Unknown Device"}
                                        </p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                            <span>IP: <span className="font-mono">{session.ipAddress}</span></span>
                                            <span>•</span>
                                            <span className={new Date() > new Date(session.expiresAt) ? "text-destructive" : "text-emerald-600"}>
                                                Expires {formatDistance(new Date(session.expiresAt), new Date(), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRevoke(session.token)}
                                >
                                    Revoke
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}