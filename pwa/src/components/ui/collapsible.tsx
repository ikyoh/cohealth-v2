"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { Slot } from "@radix-ui/react-slot"

type CollapsibleProps = CollapsiblePrimitive.Root.Props & {
  asChild?: boolean
}

function Collapsible({ asChild = false, render, ...props }: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      render={asChild ? <Slot /> : render}
      {...props}
    />
  )
}

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  asChild?: boolean
}

function CollapsibleTrigger({ asChild = false, render, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={asChild ? <Slot /> : render}
      {...props}
    />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
