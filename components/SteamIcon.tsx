interface SteamIconProps {
  className?: string
}

export function SteamIcon({ className = "w-5 h-5" }: SteamIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.008l2.861-4.142c0-.016-.002-.032-.002-.048 0-2.084 1.688-3.772 3.772-3.772 2.085 0 3.772 1.688 3.772 3.772 0 2.084-1.687 3.772-3.772 3.772h-.087l-4.089 2.921c0 .052.002.104.002.156 0 1.867-1.509 3.376-3.376 3.376-1.867 0-3.376-1.509-3.376-3.376 0-.052.002-.104.004-.156l-2.598-1.075C.344 18.982 5.678 24 11.979 24c6.624 0 11.979-5.355 11.979-11.979C23.958 5.355 18.603.001 11.979.001z"/>
    </svg>
  )
} 