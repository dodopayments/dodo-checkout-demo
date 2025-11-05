import clsx from "clsx"
import Image, { ImageProps } from "next/image"
import Link from "next/link"
import React from "react"

export default function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
}
type CustomHeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

function CustomHeading(props: CustomHeadingProps) {
  const childText = React.Children.toArray(props.children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
  const slug = slugify(childText)
  return React.createElement(
    `h${props.level}`,
    {
      id: slug,
      className: clsx(
        "scroll-mt-36 md:scroll-mt-24 inline-flex",
        props.className,
      ),
    },
    [
      React.createElement("a", {
        href: `#${slug}`,
        key: `link-${slug}`,
        className: "anchor-link",
      }),
    ],
    props.children,
  )
}

export const H1 = ({ children }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    className="text-3xl font-bold normal-case tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50"
    level={1}
  >
    {children}
  </CustomHeading>
)

export const H2 = ({ children }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    className="mb-4 text-lg font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50"
    level={2}
  >
    {children}
  </CustomHeading>
)

export const H3 = ({ children }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    className="mb-2 font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50"
    level={3}
  >
    {children}
  </CustomHeading>
)

export const P = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p {...props} className="mb-8 leading-7 text-gray-600 dark:text-gray-400" />
)

export const Ul = (props: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className="mb-10 ml-[30px] list-['–__'] space-y-1 leading-8 text-gray-600 dark:text-gray-400"
    {...props}
  />
)

export const Bold = (props: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className="font-semibold text-gray-900 dark:text-gray-50" {...props} />
)

export function CustomLink(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: React.ReactNode },
) {
  const { href, children, ...rest } = props
  const style =
    "text-lime-600 font-medium hover:text-lime-500 dark:text-lime-500 hover:dark:text-lime-400"
  if (href.startsWith("/")) {
    return (
      <Link className={style} href={href} {...rest}>
        {children}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return <a href={href} className={style} {...rest} />
  }

  return (
    <a href={href} className={style} target="_blank" rel="noopener noreferrer" {...rest} />
  )
}

export const ChangelogEntry = ({
  version,
  date,
  children,
}: {
  version: string
  date: string
  children: React.ReactNode
}) => (
  <div className="relative my-20 flex flex-col justify-center gap-x-14 border-b border-gray-200 md:flex-row dark:border-gray-800">
    <div className="mb-4 md:mb-10 md:w-1/3">
      <div className="sticky top-24 flex items-center space-x-2 md:block md:space-x-0 md:space-y-1.5">
        <span className="inline-flex items-center rounded-lg bg-lime-50 px-2.5 py-1 text-xs font-medium text-lime-700 ring-1 ring-inset ring-lime-700/10 dark:bg-lime-500/20 dark:text-lime-400 dark:ring-lime-400/10">
          {version}
        </span>
        <span className="block whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          {date}
        </span>
      </div>
    </div>
    <div className="mb-12">{children}</div>
  </div>
)

export const ChangelogImage = ({
  alt,
  width = 1200,
  height = 675,
  src,
  ...props
}: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className="mb-10 overflow-hidden rounded-xl shadow-md shadow-black/15 ring-1 ring-gray-200/50 dark:ring-gray-800"
    {...props}
  />
)
