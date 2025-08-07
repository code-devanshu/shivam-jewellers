export default function Footer() {
  return (
    <footer className="bg-pink-600 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Shivam Jewellery. All rights
          reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" aria-label="Facebook" className="hover:text-pink-300">
            {/* Facebook SVG icon */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.5 9.9v-7h-3v-3h3v-2.3c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 2v2.6h3.4l-.5 3h-2.9v7A10 10 0 0022 12z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-pink-300">
            {/* Instagram SVG icon */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 3a5 5 0 110 10 5 5 0 010-10zm6.3-1.3a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0zM12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-pink-300">
            {/* Twitter SVG icon */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.1.9 5.4 5.4 0 002.4-3 10.7 10.7 0 01-3.4 1.3 5.4 5.4 0 00-9.2 4.9A15.2 15.2 0 013 4.6a5.4 5.4 0 001.7 7.2 5.3 5.3 0 01-2.4-.7v.1a5.4 5.4 0 004.3 5.3 5.5 5.5 0 01-2.4.1 5.4 5.4 0 005 3.8 10.9 10.9 0 01-6.7 2.3c-.4 0-.8 0-1.1-.1a15.3 15.3 0 008.3 2.4c10 0 15.5-8.3 15.5-15.5 0-.2 0-.5 0-.7A11 11 0 0023 3z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
