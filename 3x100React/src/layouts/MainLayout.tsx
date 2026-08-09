import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import Chatbot from '../components/Chatbot/Chatbot';
import { ScrollToTopButton } from '../components/ScrollToTopButton';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main className="mx-auto min-h-[70vh] w-full max-w-1xl px-4 py-1 pt-1 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <ScrollToTopButton />
    </div>
  );
};
