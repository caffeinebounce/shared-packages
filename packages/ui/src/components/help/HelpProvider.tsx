"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HelpSearchResult {
  slug: string;
  title: string;
  description: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HelpContextValue {
  /** Whether the help panel is open */
  isOpen: boolean;
  /** Open the help panel */
  openHelp: (articleSlug?: string) => void;
  /** Close the help panel */
  closeHelp: () => void;
  /** Toggle the help panel */
  toggleHelp: () => void;
  /** Currently displayed article */
  activeArticle: HelpArticle | null;
  /** Set the active article by slug */
  setActiveArticle: (slug: string | null) => void;
  /** Current help context (e.g. admin or user) */
  helpContext: string;
  /** Search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Perform a search and open the panel */
  performSearch: (query: string) => void;
  /** Search results */
  searchResults: HelpSearchResult[];
  /** Open help for a specific feature */
  openFeatureHelp: (featureKey: string) => void;
  /** Navigate to an article */
  navigateToArticle: (slug: string) => void;
  /** Go back in history */
  goBack: () => void;
  /** Navigation history */
  history: string[];
  /** Can go back */
  canGoBack: boolean;
}

const HelpContext = createContext<HelpContextValue | null>(null);

export interface HelpProviderProps {
  children: ReactNode;
  /** Function to get an article by slug */
  getArticle: (slug: string) => HelpArticle | null;
  /** Function to search articles */
  searchArticles: (query: string) => HelpSearchResult[];
  /** Function to get help article slug for a feature key */
  getArticleForFeature: (featureKey: string) => string | null;
  /** Function to get help article slug for a route */
  getArticleForRoute: (pathname: string) => string | null;
  /** Function to get help context for a route */
  getContextForRoute: (pathname: string) => string;
  /** Current pathname (pass from usePathname in app) */
  pathname: string;
  /** Whether this is the admin help context (overrides route context) */
  isAdmin?: boolean;
}

export function HelpProvider({
  children,
  getArticle,
  searchArticles,
  getArticleForFeature,
  getArticleForRoute,
  getContextForRoute,
  pathname,
  isAdmin = false,
}: HelpProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  // Determine help context based on isAdmin prop or current route
  const helpContext = useMemo(
    () => (isAdmin ? "admin" : getContextForRoute(pathname)),
    [isAdmin, pathname, getContextForRoute],
  );

  // Get the active article
  const activeArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return getArticle(activeArticleSlug);
  }, [activeArticleSlug, getArticle]);

  // Search results
  const searchResults: HelpSearchResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchArticles(searchQuery);
  }, [searchQuery, searchArticles]);

  // Open the help panel
  const openHelp = useCallback(
    (articleSlug?: string) => {
      setIsOpen(true);
      if (articleSlug) {
        setActiveArticleSlug(articleSlug);
        setHistory([]);
      } else {
        // Default to contextual help for current route
        const contextualSlug = getArticleForRoute(pathname);
        setActiveArticleSlug(contextualSlug);
        setHistory([]);
      }
      setSearchQuery("");
    },
    [pathname, getArticleForRoute],
  );

  // Close the help panel
  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Toggle the help panel
  const toggleHelp = useCallback(() => {
    if (isOpen) {
      closeHelp();
    } else {
      openHelp();
    }
  }, [isOpen, openHelp, closeHelp]);

  // Set active article
  const setActiveArticle = useCallback((slug: string | null) => {
    setActiveArticleSlug(slug);
    setSearchQuery("");
  }, []);

  // Perform search
  const performSearch = useCallback((query: string) => {
    setIsOpen(true);
    setSearchQuery(query);
    setActiveArticleSlug(null);
  }, []);

  // Open help for a specific feature
  const openFeatureHelp = useCallback(
    (featureKey: string) => {
      const articleSlug = getArticleForFeature(featureKey);
      if (articleSlug) {
        setIsOpen(true);
        setActiveArticleSlug(articleSlug);
        setHistory([]);
        setSearchQuery("");
      }
    },
    [getArticleForFeature],
  );

  // Navigate to an article (with history)
  const navigateToArticle = useCallback(
    (slug: string) => {
      if (activeArticleSlug && activeArticleSlug !== slug) {
        setHistory((prev) => [...prev, activeArticleSlug]);
      }
      setActiveArticleSlug(slug);
      setSearchQuery("");
    },
    [activeArticleSlug],
  );

  // Go back in history
  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousSlug = newHistory.pop();
      setHistory(newHistory);
      setActiveArticleSlug(previousSlug || null);
    }
  }, [history]);

  const canGoBack = history.length > 0;

  // Keyboard shortcut: Ctrl+Shift+H to toggle help
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl+Shift+H (or Cmd+Shift+H on Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "H"
      ) {
        event.preventDefault();
        toggleHelp();
      }

      // Escape to close
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeHelp();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleHelp, closeHelp, isOpen]);

  // Intercept clicks on help links to open the panel instead of navigating
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href="/help"], a[href="/admin/help"]');

      if (link && !link.hasAttribute("data-prevent-help-intercept")) {
        event.preventDefault();
        event.stopPropagation();
        toggleHelp();
      }
    }

    // Use capture phase to intercept before navigation
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [toggleHelp]);

  const value: HelpContextValue = {
    isOpen,
    openHelp,
    closeHelp,
    toggleHelp,
    activeArticle,
    setActiveArticle,
    helpContext,
    searchQuery,
    setSearchQuery,
    performSearch,
    searchResults,
    openFeatureHelp,
    navigateToArticle,
    goBack,
    history,
    canGoBack,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
}
