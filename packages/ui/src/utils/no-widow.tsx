import {
  type PreventWidowsOptions,
  preventWidows,
} from "@caffeinebounce/shared-utils";
import {
  cloneElement,
  createElement,
  type ElementType,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type NoWidowOptions = PreventWidowsOptions;

export type NoWidowDomOptions = NoWidowOptions & {
  defaultWordCount?: number;
  selector?: string;
  selectors?: string[];
};

export type NoWidowTextProps = HTMLAttributes<HTMLElement> &
  NoWidowOptions & {
    as?: ElementType;
    children: ReactNode;
  };

const SKIPPED_REACT_TYPES = new Set([
  "code",
  "input",
  "kbd",
  "option",
  "pre",
  "samp",
  "script",
  "select",
  "style",
  "textarea",
]);

const DEFAULT_DOM_SELECTORS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "blockquote",
  "label",
  "a",
  "button",
  "figcaption",
  "summary",
  "dt",
  "dd",
  "span",
];

const DOM_SKIP_SELECTOR = [
  "code",
  "pre",
  "kbd",
  "samp",
  "script",
  "style",
  "textarea",
  "select",
  "input",
  "option",
  "[contenteditable='true']",
  "[contenteditable='']",
  "[aria-hidden='true']",
  "[data-no-widow]",
  "[data-widow-control='off']",
].join(",");

function parsePositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isOptedOutProps(props: Record<string, unknown>): boolean {
  return (
    props["data-no-widow"] !== undefined ||
    props["data-widow-control"] === "off" ||
    props["aria-hidden"] === true ||
    props["aria-hidden"] === "true"
  );
}

function getReactElementOptions(
  props: Record<string, unknown>,
  options: NoWidowOptions,
): NoWidowOptions {
  return {
    ...options,
    wordCount:
      parsePositiveInteger(props["data-widow-words"]) ?? options.wordCount,
  };
}

function shouldSkipReactElement(element: ReactElement): boolean {
  if (
    typeof element.type === "string" &&
    SKIPPED_REACT_TYPES.has(element.type)
  ) {
    return true;
  }

  const props = element.props as Record<string, unknown>;

  return isOptedOutProps(props);
}

export function preventWidowsInReactNode(
  children: ReactNode,
  options: NoWidowOptions = {},
): ReactNode {
  if (typeof children === "string") {
    return preventWidows(children, options);
  }

  if (Array.isArray(children)) {
    return children.map((child) => preventWidowsInReactNode(child, options));
  }

  if (!isValidElement(children) || shouldSkipReactElement(children)) {
    return children;
  }

  const props = children.props as { children?: ReactNode } & Record<
    string,
    unknown
  >;

  if (props.children === undefined) {
    return children;
  }

  const transformedChildren = preventWidowsInReactNode(
    props.children,
    getReactElementOptions(props, options),
  );

  if (transformedChildren === props.children) {
    return children;
  }

  return cloneElement(children, undefined, transformedChildren);
}

export function NoWidowText({
  as: Component = "span",
  children,
  minWords,
  preserveExistingNbsp,
  wordCount,
  ...props
}: NoWidowTextProps) {
  const dataProps = props as Record<string, unknown>;

  return createElement(
    Component,
    {
      ...props,
      "data-widow-words": wordCount ?? dataProps["data-widow-words"],
    },
    preventWidowsInReactNode(children, {
      minWords,
      preserveExistingNbsp,
      wordCount,
    }),
  );
}

function getDomSelector(options: NoWidowDomOptions): string {
  if (options.selector) {
    return options.selector;
  }

  if (options.selectors?.length) {
    return options.selectors.join(",");
  }

  return DEFAULT_DOM_SELECTORS.join(",");
}

function shouldSkipDomElement(element: Element): boolean {
  return Boolean(element.closest(DOM_SKIP_SELECTOR));
}

function getElementOptions(
  element: Element,
  options: NoWidowDomOptions,
): NoWidowOptions {
  const wordCount =
    parsePositiveInteger(element.getAttribute("data-widow-words")) ??
    options.wordCount ??
    options.defaultWordCount;

  return {
    minWords: options.minWords,
    preserveExistingNbsp: options.preserveExistingNbsp,
    wordCount,
  };
}

function processElement(element: Element, options: NoWidowDomOptions): void {
  if (shouldSkipDomElement(element)) {
    return;
  }

  const elementOptions = getElementOptions(element, options);

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) {
      continue;
    }

    const value = node.nodeValue ?? "";
    const nextValue = preventWidows(value, elementOptions);

    if (nextValue !== value) {
      node.nodeValue = nextValue;
    }
  }
}

export function applyNoWidowText(
  root: ParentNode,
  options: NoWidowDomOptions = {},
): void {
  const selector = getDomSelector(options);
  const elements = new Set<Element>();

  if (root instanceof Element && root.matches(selector)) {
    elements.add(root);
  }

  for (const element of Array.from(root.querySelectorAll(selector))) {
    elements.add(element);
  }

  for (const element of elements) {
    processElement(element, options);
  }
}
