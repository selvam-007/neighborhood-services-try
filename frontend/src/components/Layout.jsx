import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
