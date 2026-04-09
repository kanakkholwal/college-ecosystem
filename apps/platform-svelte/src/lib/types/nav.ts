import type { Session } from '$lib/types/session';

export type AllowedRoleType =
  | Session['user']['role']
  | Session['user']['other_roles'][number]
  | '*'
  | `!${string}`;

// ✅ ICON = string (iconify)
export type RouterCardLink = {
  href: string;
  title: string;
  description: string;
  external?: boolean;
  icon: string;
  allowed_roles: AllowedRoleType[] | AllowedRoleType;
  disabled?: boolean;
  category: string;
  isNew?: boolean;
};

export type RawLinkType = {
  title: string;
  path: string;
  allowed_roles: AllowedRoleType[] | AllowedRoleType;
  icon: string;
  preserveParams?: boolean;
  category: 'none' | 'metrics' | 'action' | 'view';
  items?: {
    title: string;
    path: string;
    allowed_roles: AllowedRoleType[] | AllowedRoleType;
    disabled?: boolean;
  }[];
};