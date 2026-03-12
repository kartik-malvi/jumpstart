import fi1 from '../assets/fi1.png'
import fi2 from '../assets/fi2.png'
import fi3 from '../assets/fi3.png'
import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="bg-[#0B0C0E] text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-[#0B908E] flex items-center justify-center text-white text-xl font-bold">
              J
            </div>
            <h3 className="text-lg font-semibold">Jumpstart</h3>
          </div>
          <p className="!text-white text-sm leading-relaxed !text-[14px] !leading-[20px]">
            Psychologist-designed career aptitude tests to help you discover your ideal career path.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-white text-sm">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/test">Test Packages</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/result">Results</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-white text-sm">
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>FAQs</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-white text-sm">
            <li className="flex items-end gap-2">
              <span className="text-[#0B908E] text-lg">
                <img src={fi1} className='w-[16px]'/>
              </span>
              support@jumpstart.com
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#0B908E] text-lg">
                <img src={fi2} className='w-[16px]'/>
              </span>
              +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#0B908E] text-lg">
                <img src={fi3} className='w-[16px]'/>
              </span>
              123 Education St, Learning City
            </li>
          </ul>
        </div>

      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-gray-700 mt-10 pt-4"></div>
      </div>

      {/* Bottom Text */}
      <p className="text-center !text-white text-xs mt-4 !text-[14px]">
        © 2024 Jumpstart. All rights reserved. Built by psychologists, for students.
      </p>
    </footer>
  );
}
