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
// Cohort Blocks
export type { CohortCardProps, CohortEligibility } from "./blocks/cohort";
export { CohortCard } from "./blocks/cohort";
export type {
  ColumnDataType,
  ColumnSummaryConfig,
  ColumnType,
  DataTableAddButtonProps,
  DataTableColumnFilterProps,
  DataTableColumnHeaderProps,
  DataTableColumnMeta,
  DataTableExportButtonProps,
  DataTableFilter,
  DataTableSettingDef,
  DataTableCurrencyCellProps,
  FinancialStatementConfig,
  FinancialStatementEntry,
  FlatExportRow,
  SubtotalRule,
  SubtotalRulesConfig,
  FinancialStatementSection,
  FinancialStatementTableProps,
  FinancialStatementTotal,
  TimeUnit,
  DataTableSettingsProps,
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
  DataTableAddButton,
  DataTableColumnFilter,
  DataTableColumnHeader,
  DataTableExportButton,
  DataTableFilterBadges,
  BALANCE_SHEET_CONFIG,
  buildFinancialStatementData,
  DataTableCurrencyCell,
  DataTableSettings,
  FinancialStatementTable,
  flattenStatementForExport,
  formatCurrencyValue,
  INCOME_STATEMENT_CONFIG,
  DataTablePagination,
  DataTableRowActions,
  DataTableSearch,
  DataTableSkeleton,
  DataTableSummary,
  DataTableToolbar,
  DataTableTopper,
  DataTableViewOptions,
  DataTableViews,
  useDataTableContext,
  useDataTableSettings,
  FinanceDecimalsProvider,
  useFinanceDecimals,
  useFinanceDecimalsSetting,
} from "./blocks/data-table";
export type {
  StudioBlock,
  StudioBlockCategory,
  StudioEditorProps,
  StudioProjectType,
  StudioTheme,
} from "./blocks/editor";
// GrapesJS Studio Visual Editor
export { StudioEditor } from "./blocks/editor";
export type { BackgroundRippleEffectProps } from "./blocks/effects";
export { BackgroundRippleEffect } from "./blocks/effects";
export type {
  FeedbackButtonProps,
  FeedbackDialogProps,
  FeedbackSubmission,
} from "./blocks/feedback";
export { FeedbackButton, FeedbackDialog } from "./blocks/feedback";
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
  AdminPageLayoutBackLink,
  AdminPageLayoutProps,
  AppFooterProps,
  AppHeaderProps,
  AppLayoutProps,
  AppSidebarProps,
  AppSidebarUser,
  BasePageLayoutProps,
  DashboardGridProps,
  FloatingUserMenuProps,
  FloatingUserMenuUser,
  HeaderLink,
  HelpBreadcrumb,
  HelpLayoutProps,
  HelpPageLayoutProps,
  HelpPanelLayoutProps,
  LegalLayoutProps,
  LegalSectionProps,
  MarketingLayoutProps,
  NavDivider,
  NavElement,
  NavItem,
  NavSection,
  RootLayoutAnalytics,
  RootLayoutFont,
  RootLayoutProps,
  RootLayoutToast,
  UserPageLayoutBackLink,
  UserPageLayoutProps,
  WizardLayoutProps,
} from "./blocks/layouts";
export {
  AdminPageLayout,
  AppFooter,
  AppHeader,
  AppLayout,
  AppSidebar,
  BasePageLayout,
  DashboardGrid,
  FloatingUserMenu,
  HelpLayout,
  HelpPageLayout,
  HelpPanelLayout,
  isNavDivider,
  isNavItem,
  isNavSection,
  LegalLayout,
  LegalSection,
  MarketingLayout,
  RootLayout,
  themeScript,
  UserPageLayout,
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
  LampHeroProps,
  LampHeroSocialLink,
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
  LampHero,
  ImpactSection,
  MissionSection,
  NewsletterSignup,
  NextStepsSection,
  TestimonialsSection,
} from "./blocks/marketing";
export type {
  AppDefinition,
  AppSwitcherProps,
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
  AppSwitcher,
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
export type {
  ShortcutDefinition,
  ThemeMode,
  ThemeProviderProps,
  ThemeToggleProps,
} from "./blocks/theme";
export { ThemeProvider, ThemeToggle, useTheme } from "./blocks/theme";
export type {
  UserAvatarMenuItem,
  UserAvatarMenuProps,
  UserAvatarMenuUser,
} from "./blocks/user";
export { UserAvatarMenu } from "./blocks/user";
export type {
  HelpArticle,
  HelpArticleGroup,
  HelpArticleIndexProps,
  HelpArticleViewProps,
  HelpButtonProps,
  HelpContextValue,
  HelpProviderProps,
  HelpSearchResult,
  HelpSearchResultsProps,
  HelpTooltipProps,
} from "./components/help";
export {
  HelpArticleIndex,
  HelpArticleView,
  HelpButton,
  HelpProvider,
  HelpSearchResults,
  HelpTooltip,
  useHelp,
} from "./components/help";
export {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./components/ui/alert";
export type { SaveStatus } from "./components/ui/auto-save-indicator";
export { AutoSaveIndicator } from "./components/ui/auto-save-indicator";
export type {
  AutocompleteOption,
  AutocompleteProps,
} from "./components/ui/autocomplete";
export { Autocomplete } from "./components/ui/autocomplete";
export { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
export type { BackLinkProps } from "./components/ui/back-link";
export { BackLink } from "./components/ui/back-link";
export type { BadgeProps, BadgeShape, BadgeSize } from "./components/ui/badge";
export { Badge, badgeVariants } from "./components/ui/badge";
export type {
  ButtonCorners,
  ButtonHoverEffect,
  ButtonProps,
} from "./components/ui/button";
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonGroupProps } from "./components/ui/button-group";
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./components/ui/button-group";
export type { CalendarProps } from "./components/ui/calendar";
export { Calendar } from "./components/ui/calendar";
export type {
  CardBorder,
  CardElevation,
  CardProps,
} from "./components/ui/card";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
export type {
  HoverEffectCardDescriptionProps,
  HoverEffectCardProps,
  HoverEffectCardTitleProps,
  HoverEffectItem,
  HoverEffectProps,
} from "./components/ui/card-hover-effect";
export {
  HoverEffect,
  HoverEffectCard,
  HoverEffectCardDescription,
  HoverEffectCardTitle,
} from "./components/ui/card-hover-effect";
export type { ChartConfig } from "./components/ui/chart";
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart";
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
export type {
  DatePickerProps,
  DateRangePickerProps,
} from "./components/ui/date-picker";
export { DatePicker, DateRangePicker } from "./components/ui/date-picker";
export type { DeleteConfirmationDialogProps } from "./components/ui/delete-confirmation-dialog";
export { DeleteConfirmationDialog } from "./components/ui/delete-confirmation-dialog";
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
export type {
  DisplayFieldGroupProps,
  DisplayFieldProps,
} from "./components/ui/display-field";
export { DisplayField, DisplayFieldGroup } from "./components/ui/display-field";
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
export { FormDialog } from "./components/ui/form-dialog";
export type { IconButtonProps } from "./components/ui/icon-button";
export { IconButton, iconButtonVariants } from "./components/ui/icon-button";
export type { InfoTooltipProps } from "./components/ui/info-tooltip";
export { InfoTooltip } from "./components/ui/info-tooltip";
export type {
  InlineEditableDateProps,
  InlineEditableSelectProps,
  InlineEditableTextProps,
  SelectOption,
} from "./components/ui/inline-editable";
export {
  InlineEditableDate,
  InlineEditableSelect,
  InlineEditableText,
} from "./components/ui/inline-editable";
export type { InputProps, InputVariant } from "./components/ui/input";
export { Input, inputVariants } from "./components/ui/input";
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./components/ui/input-otp";
export { Kbd, KbdGroup } from "./components/ui/kbd";
export { Label } from "./components/ui/label";
export type { LampContainerProps } from "./components/ui/lamp";
export { LampContainer } from "./components/ui/lamp";
export type { LocationMapProps } from "./components/ui/location-map";
export { LocationMap } from "./components/ui/location-map";
export type { ModernCalendarProps } from "./components/ui/modern-calendar";
export { ModernCalendar } from "./components/ui/modern-calendar";
export type { NumberStepperProps } from "./components/ui/number-stepper";
export { NumberStepper } from "./components/ui/number-stepper";
export type { PageHeaderProps } from "./components/ui/page-header";
export { PageHeader } from "./components/ui/page-header";
export type { PageLoaderProps } from "./components/ui/page-loader";
export { PageLoader } from "./components/ui/page-loader";
export type {
  PageSectionProps,
  PageSectionsProps,
} from "./components/ui/page-sections";
export { PageSection, PageSections } from "./components/ui/page-sections";
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
export type { ProfileSectionProps } from "./components/ui/profile-section";
export { ProfileSection } from "./components/ui/profile-section";
export { Progress } from "./components/ui/progress";
export type { ProgressBarProps } from "./components/ui/progress-bar";
export { ProgressBar } from "./components/ui/progress-bar";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
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
export { Slider } from "./components/ui/slider";
export type {
  SocialIconProps,
  SocialPlatform,
} from "./components/ui/social-icon";
export { SocialIcon, socialPlatforms } from "./components/ui/social-icon";
export { Toaster } from "./components/ui/sonner";
export type { SpinnerProps } from "./components/ui/spinner";
export { Spinner, spinnerVariants } from "./components/ui/spinner";
export type {
  StatCardChartConfig,
  StatCardProps,
  StatCardsContainerProps,
  StatCardTrend,
  StatChartDataPoint,
  StatValueFormat,
  TrendDirection,
} from "./components/ui/stat-card";
export { StatCard, StatCardsContainer } from "./components/ui/stat-card";
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
export type { TextHighlightProps } from "./components/ui/text-highlight";
export { TextHighlight } from "./components/ui/text-highlight";
export { Textarea } from "./components/ui/textarea";
export type { TextGenerateEffectProps } from "./components/ui/text-generate-effect";
export { TextGenerateEffect } from "./components/ui/text-generate-effect";
export type { TimeEstimateProps } from "./components/ui/time-estimate";
export { TimeEstimate } from "./components/ui/time-estimate";
export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
export type { VerificationCodeInputProps } from "./components/ui/verification-code-input";
export { VerificationCodeInput } from "./components/ui/verification-code-input";
// Theme system types and configurations
// Note: Component variant types (BadgeShape, BadgeSize, ButtonCorners, ButtonHoverEffect,
// CardBorder, CardElevation, InputVariant) are exported from their respective component files above.
export type {
  BuiltInThemeName,
  ColorScheme,
  ProductThemeConfig,
  ThemeColors,
  ThemeConfig,
  ThemeFonts,
  ThemeName,
} from "./config";
// Theme configuration
export {
  type Animation,
  animation,
  type BorderRadius,
  type Breakpoints,
  borderRadius,
  breakpoints,
  colorfulTheme,
  compassThemeConfig,
  darkTheme,
  defaultThemes,
  deuteranopiaTheme,
  getColorScheme,
  getDefaultTheme,
  highContrastDarkTheme,
  highContrastTheme,
  type Layout,
  layout,
  lightTheme,
  protanopiaTheme,
  type Shadows,
  type Spacing,
  shadows,
  spacing,
  type Theme,
  type Typography,
  theme,
  tritanopiaTheme,
  typography,
  type ZIndex,
  zenbidThemeConfig,
  zIndex,
} from "./config";
export { useCopyToClipboard } from "./hooks/useCopyToClipboard";
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
export {
  type ScrollDirection,
  type UseScrollDirectionOptions,
  useScrollDirection,
} from "./hooks/useScrollDirection";
export {
  type SessionError,
  type UseSessionErrorsOptions,
  useSessionErrors,
} from "./hooks/useSessionErrors";
export { type ToastOptions, useToast } from "./hooks/useToast";
export {
  createDataRestorationHandler,
  createFormResetHandler,
  createFormSubmitHandler,
  createStepHasFieldErrors,
  extractZodErrors,
  type FieldMeta,
  type FormSubmitHandlerOptions,
  type FormWithSetFieldValue,
  type UseWizardFormOptions,
  type UseWizardFormReturn,
  useWizardForm,
  type WizardFormInstance,
  type WizardStep,
} from "./hooks/useWizardForm";
// Utilities
export {
  type AvatarGradient,
  cn,
  getAvatarGradient,
  getGradientIndex,
  getGradientPairs,
} from "./utils/index";
