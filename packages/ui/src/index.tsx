// Blocks - composed UI components

export { toast } from "sonner";
// Admin Blocks
export { CompanyNameEditableCell } from "./blocks/admin/CompanyNameEditableCell";
export { EditableCell } from "./blocks/admin/EditableCell";
export { UserNameEditableCell } from "./blocks/admin/UserNameEditableCell";
export type {
  ClarityAnalyticsProps,
  GoogleAnalyticsProps,
} from "./blocks/analytics";
export { ClarityAnalytics, GoogleAnalytics } from "./blocks/analytics";
export type {
  DeviceInfo,
  MFAChallengeProps,
  MFAFactor,
  MFARecoveryProps,
  RecoveryMethod,
  SignOutButtonProps,
} from "./blocks/auth";
export { MFAChallenge, MFARecovery, SignOutButton } from "./blocks/auth";
export type {
  ColumnDataType,
  ColumnSummaryConfig,
  ColumnType,
  DataTableColumnFilterProps,
  DataTableColumnHeaderProps,
  DataTableColumnMeta,
  DataTableFilter,
  DataTableFilterBadgesProps,
  DataTablePaginationProps,
  DataTableProps,
  DataTableRowAction,
  DataTableRowActionsProps,
  DataTableSkeletonProps,
  DataTableSummaryProps,
  DataTableTab,
  DataTableToolbarProps,
  DataTableTopperProps,
  DataTableView,
  DataTableViewOptionsProps,
  DataTableViewState,
  DataTableViewsProps,
  FilterOption,
  FilterType,
  RowSelectionStyle,
  SummaryType,
} from "./blocks/data-table";
export {
  DataTable,
  DataTableColumnFilter,
  DataTableColumnHeader,
  DataTableFilterBadges,
  DataTablePagination,
  DataTableRowActions,
  DataTableSearch,
  DataTableSkeleton,
  DataTableSummary,
  DataTableToolbar,
  DataTableTopper,
  DataTableViewOptions,
  DataTableViews,
} from "./blocks/data-table";
export type { BackgroundRippleEffectProps } from "./blocks/effects";
export { BackgroundRippleEffect } from "./blocks/effects";
export type { FeedbackDialogProps } from "./blocks/feedback";
export { FeedbackDialog } from "./blocks/feedback";
export type {
  FormWizardNavigation,
  FormWizardProps,
  FormWizardStep,
  GetStepStatus,
  GetStepTooltip,
  StepStatus,
  StepStatusStyles,
} from "./blocks/forms";
export { FormWizard, useFormWizardNavigation } from "./blocks/forms";
export type { KeyboardShortcutProps } from "./blocks/keyboard";
export { KeyboardShortcut } from "./blocks/keyboard";
export type {
  AdminPageLayoutProps,
  AppHeaderProps,
  AppLayoutProps,
  AppSidebarProps,
  AppSidebarUser,
  DashboardGridProps,
  FloatingUserMenuProps,
  FloatingUserMenuUser,
  HeaderLink,
  LegalLayoutProps,
  LegalSectionProps,
  MarketingLayoutProps,
  NavItem,
  PageLayoutProps,
  PageTab,
  RootLayoutAnalytics,
  RootLayoutFont,
  RootLayoutProps,
  RootLayoutToast,
  WizardLayoutProps,
} from "./blocks/layouts";
export {
  AdminPageLayout,
  AppHeader,
  AppLayout,
  AppSidebar,
  DashboardGrid,
  FloatingUserMenu,
  LegalLayout,
  LegalSection,
  MarketingLayout,
  PageLayout,
  RootLayout,
  themeScript,
  WizardLayout,
} from "./blocks/layouts";
export type { ContactInfoProps } from "./blocks/legal";
export { ContactInfo } from "./blocks/legal";
export type {
  ActionCard,
  Benefit,
  BenefitsSectionProps,
  HeroSectionProps,
  HeroSectionWithRippleProps,
  ImpactSectionProps,
  LocationCard,
  MissionSectionProps,
  NewsletterSignupProps,
  NextStepsSectionProps,
  Outcome,
  Program,
  Stat,
  Testimonial,
  TestimonialsSectionProps,
} from "./blocks/marketing";
export {
  BenefitsSection,
  HeroSection,
  HeroSectionWithRipple,
  ImpactSection,
  MissionSection,
  NewsletterSignup,
  NextStepsSection,
  TestimonialsSection,
} from "./blocks/marketing";
export type {
  ComingSoonButtonProps,
  Entity,
  EntitySwitcherProps,
  EntitySwitcherShortcut,
  FooterLinkGroup,
  FooterProps,
  NavbarLogoProps,
  NavbarProps,
  NavbarUser,
  NavbarUserMenuItem,
  NavbarUserMenuProps,
  NavbarUserProfile,
  NavLink,
} from "./blocks/navigation";
export {
  ComingSoonButton,
  EntitySwitcher,
  Footer,
  Navbar,
  NavbarLogo,
  NavbarUserMenu,
} from "./blocks/navigation";
export type {
  SettingsLayoutProps,
  SettingsPage,
  SettingsRowProps,
  SettingsSectionProps,
  SettingsTab,
  SettingsTabContentProps,
  SettingsTabsProps,
} from "./blocks/settings";
export {
  SettingsLayout,
  SettingsRow,
  SettingsSection,
  SettingsTabContent,
  SettingsTabs,
} from "./blocks/settings";
export type { ShortcutDefinition, ThemeToggleProps } from "./blocks/theme";
export { ThemeToggle } from "./blocks/theme";
export type {
  UserAvatarMenuItem,
  UserAvatarMenuProps,
  UserAvatarMenuUser,
} from "./blocks/user";
export { UserAvatarMenu } from "./blocks/user";
export {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./components/ui/alert";
export type { SaveStatus } from "./components/ui/auto-save-indicator";
export { AutoSaveIndicator } from "./components/ui/auto-save-indicator";
export { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
export type { BadgeProps } from "./components/ui/badge";
export { Badge, badgeVariants } from "./components/ui/badge";
export type { ButtonProps } from "./components/ui/button";
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonGroupProps } from "./components/ui/button-group";
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./components/ui/button-group";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
export type { CheckboxProps } from "./components/ui/checkbox";
export { Checkbox } from "./components/ui/checkbox";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible";
export type { ComboboxOption, ComboboxProps } from "./components/ui/combobox";
export { Combobox } from "./components/ui/combobox";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./components/ui/command";
// Layout components
export type { ContainerProps, ContainerSize } from "./components/ui/container";
export { Container } from "./components/ui/container";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./components/ui/field";
export { Input } from "./components/ui/input";
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./components/ui/input-otp";
export { Kbd, KbdGroup } from "./components/ui/kbd";
export { Label } from "./components/ui/label";
export type { LocationMapProps } from "./components/ui/location-map";
export { LocationMap } from "./components/ui/location-map";
export type { PageHeaderProps } from "./components/ui/page-header";
export { PageHeader } from "./components/ui/page-header";
export type { PageLoaderProps } from "./components/ui/page-loader";
export { PageLoader } from "./components/ui/page-loader";
export { PasswordInput } from "./components/ui/password-input";
export type { PasswordRule } from "./components/ui/password-requirements";
export {
  defaultPasswordRules,
  extendedPasswordRules,
  PasswordRequirements,
} from "./components/ui/password-requirements";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
export { Progress } from "./components/ui/progress";
export type { ProgressBarProps } from "./components/ui/progress-bar";
export { ProgressBar } from "./components/ui/progress-bar";
export type { SectionProps, SectionSpacing } from "./components/ui/section";
export { Section } from "./components/ui/section";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
export { Separator } from "./components/ui/separator";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./components/ui/sidebar";
export { Skeleton } from "./components/ui/skeleton";
export { Toaster } from "./components/ui/sonner";
export type { SpinnerProps } from "./components/ui/spinner";
export { Spinner, spinnerVariants } from "./components/ui/spinner";
export type { StepperProps, StepperStep } from "./components/ui/stepper";
export { Stepper } from "./components/ui/stepper";
export { Switch } from "./components/ui/switch";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
export { Textarea } from "./components/ui/textarea";
export type { TimeEstimateProps } from "./components/ui/time-estimate";
export { TimeEstimate } from "./components/ui/time-estimate";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
export type { VerificationCodeInputProps } from "./components/ui/verification-code-input";
export { VerificationCodeInput } from "./components/ui/verification-code-input";
// Theme configuration
export {
  type Animation,
  animation,
  type BorderRadius,
  type Breakpoints,
  borderRadius,
  breakpoints,
  type Layout,
  layout,
  type Shadows,
  type Spacing,
  shadows,
  spacing,
  type Theme,
  type Typography,
  theme,
  typography,
  type ZIndex,
  zIndex,
} from "./config";
// Hooks
export { useDebounce } from "./hooks/useDebounce";
export {
  formatShortcut,
  type KeyboardShortcutDefinition,
  matchesShortcut,
  type UseKeyboardShortcutOptions,
  useKeyboardShortcut,
} from "./hooks/useKeyboardShortcut";
export { useLocalStorage } from "./hooks/useLocalStorage";
export {
  breakpoints as mediaBreakpoints,
  useBreakpoints,
  useMediaQuery,
} from "./hooks/useMediaQuery";
// Utilities
export {
  type AvatarGradient,
  cn,
  getAvatarGradient,
  getGradientIndex,
  getGradientPairs,
} from "./utils/index";
