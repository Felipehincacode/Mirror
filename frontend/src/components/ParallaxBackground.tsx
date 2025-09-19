export const ParallaxBackground = () => {
  return (
    <div 
      className="static-background"
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};
