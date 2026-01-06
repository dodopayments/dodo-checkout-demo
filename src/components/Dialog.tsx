"use client";

import * as DialogPrimitives from "@radix-ui/react-dialog";
import { RiCloseLine } from "@remixicon/react";
import * as React from "react";

import { cx } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Root>) {
  return <DialogPrimitives.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Trigger>) {
  return <DialogPrimitives.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Portal>) {
  return <DialogPrimitives.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Close>) {
  return <DialogPrimitives.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Overlay>) {
  return (
    <DialogPrimitives.Overlay
      data-slot="dialog-overlay"
      className={cx(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitives.Content
        data-slot="dialog-content"
        className={cx(
          "bg-white dark:bg-gray-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitives.Close
            data-slot="dialog-close"
            className="ring-offset-white focus:ring-gray-950 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600 absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-300 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <RiCloseLine className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitives.Close>
        )}
      </DialogPrimitives.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cx("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cx(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Title>) {
  return (
    <DialogPrimitives.Title
      data-slot="dialog-title"
      className={cx(
        "text-lg leading-none font-semibold text-gray-900 dark:text-gray-50",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitives.Description>) {
  return (
    <DialogPrimitives.Description
      data-slot="dialog-description"
      className={cx(
        "text-sm text-gray-600 dark:text-gray-400",
        className
      )}
      {...props}
    />
  );
}

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
};

