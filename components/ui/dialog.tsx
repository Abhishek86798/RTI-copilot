"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { setPageScrollLocked } from "@/components/smooth-scroll";
import { useI18n } from "@/lib/client/i18n";
import { cn } from "@/lib/utils";

/**
 * A modal dialog, built on the native `<dialog>` element.
 *
 * `showModal()` is used rather than a hand-rolled overlay because the browser
 * already does the hard parts correctly: it traps focus inside the dialog,
 * marks everything behind it inert so a screen reader cannot wander into the
 * page underneath, closes on Escape, and renders in the top layer so no
 * z-index anywhere else can end up on top of it. Every one of those is a bug
 * waiting to happen in a div-based modal.
 *
 * What the browser does not do is stop the page behind from scrolling, and
 * with smooth scrolling installed the wheel is being intercepted globally —
 * so the lock is applied explicitly.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the heading inside the dialog. */
  labelledBy: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();

    setPageScrollLocked(open);
    return () => setPageScrollLocked(false);
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-print="hide"
      aria-labelledby={labelledBy}
      /*
       * The native `close` event, which fires for Escape and for the close
       * button alike. Letting the browser close itself and then telling the
       * parent — rather than intercepting the cancel — keeps one path for
       * every way out of the dialog.
       */
      onClose={onClose}
      className={cn(
        "m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100dvh-3rem)] overflow-y-auto",
        "border border-border bg-background p-0 text-foreground shadow-2xl",
        "backdrop:bg-foreground/45 open:animate-rise",
        className
      )}
    >
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label={t("common.close")}
          className="absolute top-3 right-3 flex size-12 items-center justify-center opacity-75 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
