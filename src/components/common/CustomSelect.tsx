import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Option = { value: string | number; label: React.ReactNode };

type Props = React.ComponentPropsWithoutRef<'div'> & {
  value?: string | number;
  onChange?: (e: { target: { value: string | number } }) => void;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  [key: string]: unknown;
};

export function CustomSelect({
  value,
  onChange,
  children,
  className,
  placeholder,
  variant = 'filled',
  ...rest
}: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const closeTimeout = useRef<number | null>(null);

  const options: Option[] = React.Children.toArray(children as React.ReactNode)
    .filter(Boolean)
    .map((ch) => {
      const child = ch as React.ReactElement<{
        value?: string | number;
        children?: React.ReactNode;
      }>;
      return { value: child.props.value ?? '', label: child.props.children };
    });

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handleClose();
    }

    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      // cancel pending close
      if (closeTimeout.current) {
        window.clearTimeout(closeTimeout.current);
        closeTimeout.current = null;
      }
      setVisible(true);
      // ensure element mounts first, then trigger enter animation in next frame
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setAnimating(true));
      });
      setHighlight(options.findIndex((o) => String(o.value) === String(value)));
    } else {
      // start exit animation
      setAnimating(false);
      setHighlight(null);
      closeTimeout.current = window.setTimeout(() => setVisible(false), 160);
    }
  }, [open, value, children]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    };
  }, []);

  function handleClose() {
    setOpen(false);
  }

  function selectAt(i: number) {
    const opt = options[i];
    if (!opt) return;
    onChange?.({ target: { value: opt.value } });
    // trigger close with animation
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => (h === null ? 0 : Math.min(options.length - 1, h + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => (h === null ? options.length - 1 : Math.max(0, h - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlight !== null) selectAt(highlight);
      else setOpen((o) => !o);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }

  // Variant classes
  const btnBase =
    'w-full h-10 px-3 text-sm rounded-lg flex items-center justify-between transition-shadow';
  const btnVariant =
    variant === 'filled'
      ? 'border border-input bg-card text-card-foreground shadow-sm hover:shadow-md'
      : variant === 'outline'
      ? 'border border-input bg-background text-foreground hover:bg-muted/5'
      : 'bg-transparent text-foreground';

  // reduced gap (mt-1) and animation utility classes
  const listBase =
    'absolute mt-1 w-full max-h-60 overflow-auto rounded-md z-50 py-1 transition-all duration-150 transform origin-top';
  const listVariant =
    variant === 'filled'
      ? 'bg-card border border-input shadow-lg'
      : variant === 'outline'
      ? 'bg-background border border-border'
      : 'bg-transparent border border-border';

  const itemHover = variant === 'filled' ? 'bg-muted/80' : 'bg-muted/40';

  // animation classes depend on animating state
  const listAnimClass = animating
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 -translate-y-1 scale-[0.98] pointer-events-none';

  return (
    <div ref={ref} className={cn('relative inline-block', className)} {...rest}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(btnBase, btnVariant)}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {visible && (
        <ul role="listbox" tabIndex={-1} className={cn(listBase, listVariant, listAnimClass)}>
          {options.map((opt, i) => (
            <li
              key={String(opt.value)}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              onMouseEnter={() => setHighlight(i)}
              onMouseLeave={() => setHighlight(null)}
              onClick={() => selectAt(i)}
              className={cn(
                'px-3 py-1.5 cursor-pointer text-sm',
                highlight === i ? itemHover : '',
                String(opt.value) === String(value) ? 'font-medium' : '',
              )}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
