// Blocks - composed UI components

export { toast } from "sonner";
// Admin Blocks
export { CompanyNameEditableCell } from "./blocks/admin/CompanyNameEditableCell";
export { EditableCell } from "./blocks/admin/EditableCell";
export { UserNameEditableCell } from "./blocks/admin/UserNameEditableCell";
export type {
  ClarityAnalyticsProps,
  GoogleAnalyticsProps,
  GoogleTagManagerProps,
} from "./blocks/analytics";
export {
  ClarityAnalytics,
  GoogleAnalytics,
  GoogleTagManager,
} from "./blocks/analytics";
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
  StudioBlock,
  StudioBlockCategory,
  StudioEditorProps,
  StudioProjectType,
  StudioTheme,
} from "./blocks/editor";
// GrapesJS Studio Visual Editor
export { StudioEditor } from "./blocks/editor";
export type {
  BackgroundRippleEffectProps,
  RollingBackgroundProps,
} from "./blocks/effects";
export { BackgroundRippleEffect, RollingBackground } from "./blocks/effects";
export type {
  FeedbackButtonProps,
  FeedbackDialogProps,
  FeedbackSubmission,
} from "./blocks/feedback";
export { FeedbackButton, FeedbackDialog } from "./blocks/feedback";
export * from "./blocks/finance";
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
export type {
  ContactInfoProps,
  DisclosureFootnotesProps,
  DisclosureItem,
} from "./blocks/legal";
export { ContactInfo, DisclosureFootnotes } from "./blocks/legal";
export type {
  ActionCard,
  AppleCardProps,
  AppleCardsCarouselCard,
  AppleCardsCarouselProps,
  Benefit,
  BenefitsSectionProps,
  CarouselControlPlacement,
  CarouselNavigationMode,
  CarouselProps,
  CarouselRenderContext,
  CarouselSlide,
  CarouselSlideImage,
  CTAWithDashedGridLinesProps,
  CtaWithDashedGridLinesProps,
  EditorialHeroProps,
  FaqAccordionItem,
  FaqAccordionProps,
  HeroSectionProps,
  HeroSectionWithRippleProps,
  ImpactSectionProps,
  LampHeroProps,
  LampHeroSocialLink,
  LocationCard,
  MarketingProseProps,
  MediaTextHeroProps,
  MetricStoryProps,
  MissionSectionProps,
  NewsletterSignupProps,
  NextStepsSectionProps,
  Outcome,
  PageHeroAction,
  PageHeroMedia,
  PageHeroProps,
  PartnerLogoGridGroup,
  PartnerLogoGridProps,
  Program,
  ProgramCardProps,
  SectionShellProps,
  StackedIsometricFeatureItem,
  StackedIsometricFeaturesProps,
  Stat,
  TeamCardLink,
  TeamCardProps,
  Testimonial,
  TestimonialsSectionProps,
} from "./blocks/marketing";
export {
  AppleCard,
  AppleCardsCarousel,
  BenefitsSection,
  Carousel,
  CTAWithDashedGridLines,
  CtaWithDashedGridLines,
  EditorialHero,
  FaqAccordion,
  HeroSection,
  HeroSectionWithRipple,
  ImpactSection,
  LampHero,
  MarketingProse,
  MediaTextHero,
  MetricStory,
  MissionSection,
  NewsletterSignup,
  NextStepsSection,
  PageHero,
  PartnerLogoGrid,
  ProgramCard,
  SectionShell,
  StackedIsometricFeatures,
  TeamCard,
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
  MarketingHeaderPresetCta,
  MarketingHeaderPresetProps,
  NavbarLogoProps,
  NavbarMenuClassNames,
  NavbarMenuGroup,
  NavbarProps,
  NavbarUser,
  NavbarUserMenuItem,
  NavbarUserMenuProps,
  NavbarUserProfile,
  NavLink,
  NonprofitFooterPresetLink,
  NonprofitFooterPresetProps,
  RouteSegmentedSwitcherItem,
  RouteSegmentedSwitcherProps,
  SegmentedSwitcherItem,
  SegmentedSwitcherMatchMode,
  SegmentedSwitcherProps,
} from "./blocks/navigation";
export {
  AppSwitcher,
  ComingSoonButton,
  EntitySwitcher,
  Footer,
  MarketingHeaderPreset,
  Navbar,
  NavbarLogo,
  NavbarUserMenu,
  NonprofitFooterPreset,
  RouteSegmentedSwitcher,
  SegmentedSwitcher,
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
export * from "./blocks/table";
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
export type { SaveStatus } from "./components/custom/auto-save-indicator";
export { AutoSaveIndicator } from "./components/custom/auto-save-indicator";
export type {
  AutocompleteOption,
  AutocompleteProps,
} from "./components/custom/autocomplete";
export { Autocomplete } from "./components/custom/autocomplete";
export type { BackLinkProps } from "./components/custom/back-link";
export { BackLink } from "./components/custom/back-link";
export type {
  HoverEffectCardDescriptionProps,
  HoverEffectCardProps,
  HoverEffectCardTitleProps,
  HoverEffectItem,
  HoverEffectProps,
} from "./components/custom/card-hover-effect";
export {
  HoverEffect,
  HoverEffectCard,
  HoverEffectCardDescription,
  HoverEffectCardTitle,
} from "./components/custom/card-hover-effect";
// Layout components
export type {
  ContainerProps,
  ContainerSize,
} from "./components/custom/container";
export { Container } from "./components/custom/container";
// Data state utilities
export {
  DataStateBanner,
  DataStateInline,
} from "./components/custom/data-state";
export type {
  DatePickerProps,
  DateRangePickerProps,
} from "./components/custom/date-picker";
export { DatePicker, DateRangePicker } from "./components/custom/date-picker";
export type { DeleteConfirmationDialogProps } from "./components/custom/delete-confirmation-dialog";
export { DeleteConfirmationDialog } from "./components/custom/delete-confirmation-dialog";
export type {
  DisplayFieldGroupProps,
  DisplayFieldProps,
} from "./components/custom/display-field";
export {
  DisplayField,
  DisplayFieldGroup,
} from "./components/custom/display-field";
export type {
  DraggableCardBodyProps,
  DraggableCardContainerProps,
} from "./components/custom/draggable-card";
export {
  DraggableCardBody,
  DraggableCardContainer,
} from "./components/custom/draggable-card";
export { DraggableStickyModal } from "./components/custom/draggable-sticky-modal";
export { FormDialog } from "./components/custom/form-dialog";
export type {
  GlowingEffectCorners,
  GlowingEffectProps,
  GlowingEffectVariant,
} from "./components/custom/glowing-effect";
export { GlowingEffect } from "./components/custom/glowing-effect";
export type {
  GooeyInputClassNames,
  GooeyInputProps,
} from "./components/custom/gooey-input";
export { GooeyInput } from "./components/custom/gooey-input";
export type { IconButtonProps } from "./components/custom/icon-button";
export {
  IconButton,
  iconButtonVariants,
} from "./components/custom/icon-button";
export type { InfoTooltipProps } from "./components/custom/info-tooltip";
export { InfoTooltip } from "./components/custom/info-tooltip";
export type {
  InlineEditableDateProps,
  InlineEditableSelectProps,
  InlineEditableTextProps,
  SelectOption,
} from "./components/custom/inline-editable";
export {
  InlineEditableDate,
  InlineEditableSelect,
  InlineEditableText,
} from "./components/custom/inline-editable";
export type {
  LampColorTheme,
  LampContainerProps,
} from "./components/custom/lamp";
export { LampContainer } from "./components/custom/lamp";
export type { LocationMapProps } from "./components/custom/location-map";
export { LocationMap } from "./components/custom/location-map";
export type { ModernCalendarProps } from "./components/custom/modern-calendar";
export { ModernCalendar } from "./components/custom/modern-calendar";
export type { NumberStepperProps } from "./components/custom/number-stepper";
export { NumberStepper } from "./components/custom/number-stepper";
export type { PageHeaderProps } from "./components/custom/page-header";
export { PageHeader } from "./components/custom/page-header";
export type { PageLoaderProps } from "./components/custom/page-loader";
export { PageLoader } from "./components/custom/page-loader";
export type {
  PageSectionProps,
  PageSectionsProps,
} from "./components/custom/page-sections";
export { PageSection, PageSections } from "./components/custom/page-sections";
export { PasswordInput } from "./components/custom/password-input";
export type { PasswordRule } from "./components/custom/password-requirements";
export {
  defaultPasswordRules,
  extendedPasswordRules,
  PasswordRequirements,
} from "./components/custom/password-requirements";
export type { PixelatedCanvasProps } from "./components/custom/pixelated-canvas";
export { PixelatedCanvas } from "./components/custom/pixelated-canvas";
export type { ProfileSectionProps } from "./components/custom/profile-section";
export { ProfileSection } from "./components/custom/profile-section";
export type { ProgressBarProps } from "./components/custom/progress-bar";
export { ProgressBar } from "./components/custom/progress-bar";
export type { SectionProps, SectionSpacing } from "./components/custom/section";
export { Section } from "./components/custom/section";
export type {
  SocialIconProps,
  SocialPlatform,
} from "./components/custom/social-icon";
export { SocialIcon, socialPlatforms } from "./components/custom/social-icon";
export type {
  StatCardChartConfig,
  StatCardProps,
  StatCardsContainerProps,
  StatCardTrend,
  StatChartDataPoint,
  StatValueFormat,
  TrendDirection,
} from "./components/custom/stat-card";
export { StatCard, StatCardsContainer } from "./components/custom/stat-card";
export type { StepperProps, StepperStep } from "./components/custom/stepper";
export { Stepper } from "./components/custom/stepper";
export type { TextGenerateEffectProps } from "./components/custom/text-generate-effect";
export { TextGenerateEffect } from "./components/custom/text-generate-effect";
export type { TextHighlightProps } from "./components/custom/text-highlight";
export { TextHighlight } from "./components/custom/text-highlight";
export type { TimeEstimateProps } from "./components/custom/time-estimate";
export { TimeEstimate } from "./components/custom/time-estimate";
export type { TooltipCardProps } from "./components/custom/tooltip-card";
export { TooltipCard } from "./components/custom/tooltip-card";
export type { VerificationCodeInputProps } from "./components/custom/verification-code-input";
export { VerificationCodeInput } from "./components/custom/verification-code-input";
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
export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./components/ui/avatar";
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
  buttonGroupVariants,
} from "./components/ui/button-group";
export type { CalendarProps } from "./components/ui/calendar";
export { Calendar, CalendarDayButton } from "./components/ui/calendar";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./components/ui/empty";
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
export type { InputProps, InputVariant } from "./components/ui/input";
export { Input, inputVariants } from "./components/ui/input";
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./components/ui/input-otp";
export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./components/ui/item";
export { Kbd, KbdGroup } from "./components/ui/kbd";
export { Label } from "./components/ui/label";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPrimitive,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenuViewportPrimitive,
  navigationMenuTriggerStyle,
} from "./components/ui/navigation-menu";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./components/ui/popover";
export { Progress } from "./components/ui/progress";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
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
export { Toaster } from "./components/ui/sonner";
export type { SpinnerProps } from "./components/ui/spinner";
export { Spinner, spinnerVariants } from "./components/ui/spinner";
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
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
} from "./components/ui/tabs";
export { Textarea } from "./components/ui/textarea";
export { Toggle, toggleVariants } from "./components/ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
// Theme system types and configurations
// Note: Component variant types (BadgeShape, BadgeSize, ButtonCorners, ButtonHoverEffect,
// CardBorder, CardElevation, InputVariant) are exported from their respective component files above.
export type {
  BuiltInThemeName,
  ColorScheme,
  ProductThemeConfig,
  ThemeButtons,
  ThemeButtonVariant,
  ThemeButtonVariantName,
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
export { useComparisonData } from "./hooks/useComparisonData";
export { useCopyToClipboard } from "./hooks/useCopyToClipboard";
// Hooks
export { useDebounce } from "./hooks/useDebounce";
export {
  getDefaultLtmRange,
  useFinancialStatementState,
} from "./hooks/useFinancialStatementState";
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
export { useStatementExport } from "./hooks/useStatementExport";
export { useStatementMobileMode } from "./hooks/useStatementMobileMode";
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
export {
  type AvatarGradient,
  type CanonicalDataState,
  cn,
  type DataStateMetadata,
  getAvatarGradient,
  getGradientIndex,
  getGradientPairs,
  type ResolveDataStateInput,
  type ResolvedDataState,
  resolveDataState,
} from "./utils/index";
export {
  applyNoWidowText,
  type NoWidowDomOptions,
  type NoWidowOptions,
  NoWidowText,
  type NoWidowTextOwnProps,
  type NoWidowTextProps,
  preventWidowsInReactNode,
} from "./utils/no-widow";
export {
  NoWidowProvider,
  type NoWidowProviderProps,
} from "./utils/no-widow-provider";
