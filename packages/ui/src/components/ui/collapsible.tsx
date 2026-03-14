"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/**
 * Collapsible - Expandable/collapsible content container
 *
 * @example
 * <Collapsible open={isOpen} onOpenChange={setIsOpen}>
 *   <CollapsibleTrigger>Show more</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     Hidden content that can be toggled
 *   </CollapsibleContent>
 * </Collapsible>
 */
const Collapsible = CollapsiblePrimitive.Root;

/**
 * CollapsibleTrigger - Button to toggle collapsible content
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

/**
 * CollapsibleContent - Content that can be collapsed/expanded
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
