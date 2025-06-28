import { SidebarProvider } from "@/components/ui/sidebar"
import { BusinessSidebar } from "@/components/business-sidebar"

export default function SidebarTestPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <BusinessSidebar userName="Test User" />
        <main className="flex-1 overflow-auto pt-16 md:pt-0">
          <div className="p-4 md:p-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Sidebar Test Page
              </h1>
              <p className="text-muted-foreground">
                Testing the sidebar navigation implementation
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-medium">Sidebar Features</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Collapsible sidebar (desktop)</li>
                  <li>• Mobile-responsive overlay</li>
                  <li>• Smooth transitions</li>
                  <li>• Icon navigation</li>
                  <li>• User profile section</li>
                </ul>
              </div>
              
              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-medium">Navigation Items</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Dashboard</li>
                  <li>• Services</li>
                  <li>• Bookings</li>
                  <li>• Availability</li>
                  <li>• Analytics</li>
                  <li>• Reviews</li>
                  <li>• Profile</li>
                  <li>• Settings</li>
                </ul>
              </div>
              
              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-medium">Responsive Design</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• 240px expanded (desktop)</li>
                  <li>• 60px collapsed (desktop)</li>
                  <li>• Full overlay (mobile)</li>
                  <li>• Touch-friendly buttons</li>
                </ul>
              </div>
              
              <div className="p-6 bg-white rounded-lg border">
                <h3 className="font-medium">Accessibility</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• ARIA labels</li>
                  <li>• Keyboard navigation</li>
                  <li>• Focus indicators</li>
                  <li>• Screen reader support</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-medium mb-4">Test Instructions</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Desktop</h4>
                  <ul className="mt-2 text-gray-600 space-y-1">
                    <li>1. Click the toggle button to collapse/expand sidebar</li>
                    <li>2. Verify icons show in collapsed mode</li>
                    <li>3. Test navigation link highlighting</li>
                    <li>4. Check smooth transitions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Mobile</h4>
                  <ul className="mt-2 text-gray-600 space-y-1">
                    <li>1. Resize browser to mobile width (&lt;768px)</li>
                    <li>2. Click hamburger menu to open sidebar</li>
                    <li>3. Click outside to close overlay</li>
                    <li>4. Test navigation link clicks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}