import Link from "next/link";

function Button({
  title,
  icon = "",
  clickHandler,
  href,
  className = "bg-transparent",
}) {
  const commonClasses = `flex items-center justify-between cursor-pointer w-45 transition-all duration-300 px-2 py-3 text-sm rounded-md ${className}`;

  if (href) {
    return (
      <div className="pl-5">
        {/*Link component */}
        <Link href={href} className={commonClasses}>
          <span>{title}</span>
          <span>{icon}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pl-5">
      <button className={commonClasses} onClick={clickHandler}>
        <span>{title}</span>
        <span>{icon}</span>
      </button>
    </div>
  );
}

export default Button;
