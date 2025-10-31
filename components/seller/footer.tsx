type SellerFooterProps = {
  className?: string;
};

export default function SellerFooter({ className = "" }: SellerFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={`bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-t-2 border-orange-200 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 text-center">
        <p className="text-sm text-amber-800">
          © {year} <span className="font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">CannedIt Seller</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
