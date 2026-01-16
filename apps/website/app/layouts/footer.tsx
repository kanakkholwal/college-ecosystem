import {
    Facebook,
    Instagram,
    Linkedin,
    Twitter
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">About NITH</a></li>
              <li><a href="#" className="hover:text-gray-300">Academics</a></li>
              <li><a href="#" className="hover:text-gray-300">Admissions</a></li>
              <li><a href="#" className="hover:text-gray-300">Research</a></li>
              <li><a href="#" className="hover:text-gray-300">Campus Life</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Important Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">MHRD</a></li>
              <li><a href="#" className="hover:text-gray-300">NIRF</a></li>
              <li><a href="#" className="hover:text-gray-300">NPTEL</a></li>
              <li><a href="#" className="hover:text-gray-300">SWAYAM</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <address className="not-italic">
              <p>National Institute of Technology Hamirpur</p>
              <p>Hamirpur - 177005, Himachal Pradesh, India</p>
              <p className="mt-2">Phone: +91-1972-254001</p>
              <p>Email: registrar@nith.ac.in</p>
            </address>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-300">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-gray-300">
                <Twitter size={24} />
              </a>
              <a href="#" className="hover:text-gray-300">
                <Linkedin size={24} />
              </a>
              <a href="#" className="hover:text-gray-300">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>© {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}