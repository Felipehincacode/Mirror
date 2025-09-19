import { LoginForm } from './LoginForm';

export const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm border-2 border-foreground rounded-3xl mx-2 my-4 md:my-8 shadow-2xl overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/background.jpg)' }}></div>

      {/* Decorative elements with lower opacity */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/5 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-accent/8 to-error/8 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>

      {/* Logo - bigger */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <img
          src="/logo_mirror.png"
          alt="Mirror"
          className="h-24 w-auto object-contain opacity-80"
        />
      </div>

      <div className="relative z-10 mt-16">
        <LoginForm />
      </div>
    </div>
  );
};
