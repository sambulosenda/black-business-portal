export default function TestPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This page tests if the sidebar is working correctly.</p>
      <div className="mt-4 p-4 bg-muted rounded">
        <p>If you can see the sidebar on the left, it&apos;s working!</p>
        <p>The sidebar should have menu items like Dashboard, Services, etc.</p>
      </div>
    </div>
  )
}