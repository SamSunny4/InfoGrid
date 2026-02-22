export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", overflow: "auto" }}>
      {children}
    </div>
  );
}
