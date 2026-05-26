export default function Logo({ height = 38 }) {
  return (
    <img
      src="/logo.png"
      alt="Renoberto"
      className="site-logo"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
